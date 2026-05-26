'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatCnpj, formatDateTime } from '@/lib/format';
import { maskCep, maskPhone } from '@/lib/masks';
import { listResource } from '@/lib/api-client';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  SCHOOL_PROFILE_LABELS,
  SCHOOL_STATUS_LABELS,
  SCHOOL_TYPE_LABELS,
  type School,
} from './types';
import { SchoolStatusBadge } from './columns';
import { SchoolCalendarsTab } from './school-calendars-tab';
import { SchoolEnrollmentsTab } from './enrollments-tab';
import { SchoolAssetsTab } from './assets-tab';
import { SchoolStaffAttendanceTab } from './staff-attendance-tab';
import { useDeleteSchool, useSchool } from './hooks';

interface SchoolKpiRow {
  id: string;
}

function SchoolProfiles({ profiles }: { profiles: School['profiles'] }) {
  if (!profiles?.length) {
    return <span className="text-sm text-muted-foreground">Nenhum perfil específico.</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {profiles.map((p) => (
        <Badge key={p} variant="outline">
          {SCHOOL_PROFILE_LABELS[p] ?? p}
        </Badge>
      ))}
    </div>
  );
}

function DetailFieldList({ rows }: { rows: Array<[string, string]> }) {
  if (!rows.length) {
    return <span className="text-sm text-muted-foreground">Nenhuma meta cadastrada.</span>;
  }

  return (
    <div className="grid gap-2 md:grid-cols-2">
      {rows.map(([label, value]) => (
        <DetailField key={label} label={label} value={value || '—'} />
      ))}
    </div>
  );
}

function useSchoolKpis(schoolId: string) {
  const kpis = useQueries({
    queries: [
      {
        queryKey: ['schools', 'enrollments', 'kpi', schoolId, 'active'],
        queryFn: () =>
          listResource<SchoolKpiRow>('enrollments', {
            filter: { school_id: schoolId, status: 'active' },
            limit: 200,
          }),
      },
      {
        queryKey: ['schools', 'assets', 'kpi', schoolId],
        queryFn: () =>
          listResource<SchoolKpiRow>('assets', {
            filter: { school_id: schoolId },
            limit: 200,
          }),
      },
    ],
  });

  const [activeEnrollments, assets] = kpis;

  return {
    queries: kpis,
    cards: [
      {
        label: 'Total de alunos matriculados (ativos)',
        value: activeEnrollments.data?.data.length ?? 0,
        icon: 'Users',
        accent: 'primary',
      },
      {
        label: 'Total de patrimônios',
        value: assets.data?.data.length ?? 0,
        icon: 'Package',
        accent: 'secondary',
      },
    ] satisfies Stat[],
    loading: kpis.some((q) => q.isLoading),
  };
}

export function SchoolDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: school, isLoading, isError } = useSchool(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteSchool();

  const { cards: kpiCards, loading: kpiLoading } = useSchoolKpis(id);

  const addr = school?.address;
  const coord = school?.coordinates;
  const idebRows: Array<[string, string]> = school?.ideb_targets
    ? Object.entries(school.ideb_targets).map(([k, v]) => [k, String(v)])
    : [];

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Escola excluída.');
      router.push('/cadastros');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Cadastros' },
          { label: 'Escolas', href: '/cadastros' },
          { label: school?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !school ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Escola não encontrada ou indisponível.{' '}
              <Link href="/cadastros" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/cadastros" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{school.name}</h1>
                      <SchoolStatusBadge status={school.operation_status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {SCHOOL_TYPE_LABELS[school.type]}
                      {school.code ? ` · ${school.code}` : ''}
                      {addr?.cidade ? ` · ${addr.cidade}${addr.uf ? `/${addr.uf}` : ''}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/cadastros/${id}/editar`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    Excluir
                  </Button>
                </div>
              </div>

              <StatCards stats={kpiCards} loading={kpiLoading} />

              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="matriculas">Matrículas</TabsTrigger>
                  <TabsTrigger value="calendario">Calendário</TabsTrigger>
                  <TabsTrigger value="patrimonio">Patrimônio</TabsTrigger>
                  <TabsTrigger value="frequencia">Frequência de servidores</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Identificação institucional</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={school.id} />
                        <DetailField label="Tenant" value={school.tenant_id} />
                        <DetailField label="Código interno" value={school.code ?? '—'} />
                        <DetailField label="Código INEP" value={school.inep_code ?? '—'} />
                        <DetailField label="Nome completo" value={school.name} />
                        <DetailField label="Nome curto" value={school.short_name ?? '—'} />
                        <DetailField
                          label="Tipo"
                          value={
                            <Badge variant="secondary">{SCHOOL_TYPE_LABELS[school.type]}</Badge>
                          }
                        />
                        <DetailField
                          label="Situação"
                          value={
                            <SchoolStatusBadge status={school.operation_status} />
                          }
                        />
                        <DetailField
                          label="Situação (texto)"
                          value={SCHOOL_STATUS_LABELS[school.operation_status]}
                        />
                        <DetailField label="CNPJ" value={formatCnpj(school.cnpj)} />
                        <DetailField
                          label="Inscrição estadual"
                          value={school.state_registration ?? '—'}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contato e localização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="E-mail" value={school.email ?? '—'} />
                        <DetailField label="Telefone" value={school.phone ? maskPhone(school.phone) : '—'} />
                        <DetailField label="Região / zona" value={school.region ?? '—'} />
                        <DetailField label="CEP" value={addr?.cep ? maskCep(addr.cep) : '—'} />
                        <DetailField
                          label="Logradouro"
                          value={
                            addr?.logradouro
                              ? `${addr.logradouro}${addr.numero ? `, ${addr.numero}` : ''}`
                              : '—'
                          }
                        />
                        <DetailField label="Bairro" value={addr?.bairro ?? '—'} />
                        <DetailField
                          label="Município"
                          value={
                            addr?.cidade
                              ? `${addr.cidade}${addr.uf ? `/${addr.uf}` : ''}`
                              : '—'
                          }
                        />
                        <DetailField
                          label="Coordenadas"
                          value={
                            coord?.lat != null && coord?.lng != null
                              ? `${coord.lat}, ${coord.lng}`
                              : '—'
                          }
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Perfis e metas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Perfis da escola</p>
                        <div className="mt-1.5">
                          <SchoolProfiles profiles={school.profiles} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Metas IDEB</p>
                        <div className="mt-1.5">
                          <DetailFieldList rows={idebRows} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Detalhes técnicos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criada em" value={formatDateTime(school.created_at)} />
                        <DetailField label="Atualizada em" value={formatDateTime(school.updated_at)} />
                        <DetailField
                          label="Excluída em"
                          value={school.deleted_at ? formatDateTime(school.deleted_at) : '—'}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="matriculas">
                  <SchoolEnrollmentsTab schoolId={id} />
                </TabsContent>

                <TabsContent value="calendario">
                  <SchoolCalendarsTab schoolId={id} />
                </TabsContent>

                <TabsContent value="patrimonio">
                  <SchoolAssetsTab schoolId={id} />
                </TabsContent>

                <TabsContent value="frequencia">
                  <SchoolStaffAttendanceTab schoolId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criada em" value={formatDateTime(school.created_at)} />
                        <DetailField label="Atualizada em" value={formatDateTime(school.updated_at)} />
                        <DetailField
                          label="Excluída em"
                          value={school.deleted_at ? formatDateTime(school.deleted_at) : '—'}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        destructive
        loading={del.isPending}
        title="Excluir escola?"
        description={school ? `A escola "${school.name}" será excluída.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
