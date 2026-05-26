'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatCpf, formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { listResource } from '@/lib/api-client';
import { StaffMemberStatusBadge } from './columns';
import { StaffContractsTab } from './staff-contracts-tab';
import { StaffAccessGrantsTab } from './staff-access-grants-tab';
import { StaffAttendanceTab } from './staff-attendance-tab';
import { StaffRemovalsTab } from './staff-removals-tab';
import { StaffAuditTab } from './staff-audit-tab';
import { useDeleteStaffMember, useStaffMember } from './hooks';

interface StaffContractKpiRow {
  id: string;
  status: string | null;
}

interface AccessGrantKpiRow {
  id: string;
  starts_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

function isActiveAccessGrant(grant: AccessGrantKpiRow): boolean {
  if (grant.revoked_at) return false;

  const now = Date.now();
  const startsAt = grant.starts_at ? new Date(grant.starts_at).getTime() : Number.MIN_SAFE_INTEGER;
  const expiresAt = grant.expires_at ? new Date(grant.expires_at).getTime() : Number.MAX_SAFE_INTEGER;

  if (Number.isNaN(startsAt) || Number.isNaN(expiresAt)) return false;

  return startsAt <= now && now <= expiresAt;
}

export function StaffMemberDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: member, isLoading, isError } = useStaffMember(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteStaffMember();
  const userId = member?.user_id ?? null;
  const userIdForQueries = userId ?? '';

  const queries = useQueries({
    queries: [
      {
        queryKey: ['staff-members', 'contracts', 'kpi', id],
        queryFn: () =>
          listResource<StaffContractKpiRow>('staff-contracts', {
            filter: { staff_member_id: id, status: 'active' },
            limit: 100,
          }),
        enabled: Boolean(id),
      },
      {
        queryKey: ['staff-members', 'access-grants', 'kpi', id, userId],
        queryFn: () =>
          listResource<AccessGrantKpiRow>('access-grants', {
            filter: { user_id: userIdForQueries },
            limit: 100,
          }),
        enabled: Boolean(userId),
      },
    ],
  });

  const [contractKpi, accessGrantKpi] = queries;

  const kpiLoading = queries.some((query) => query.isLoading);

  const hasSchool = Boolean(member?.current_school_name || member?.current_school_id);

  const kpiCards: Stat[] = [
    {
      label: 'Contratos vigentes',
      value: contractKpi.data?.data.length ?? 0,
      icon: 'FileText',
      accent: 'primary',
    },
    ...(hasSchool
      ? [
          {
            label: 'Lotação atual',
            value: member?.current_school_name ?? member?.current_school_id ?? '—',
            icon: 'MapPin',
            accent: 'secondary' as const,
          },
        ]
      : []),
  ];

  if (member?.user_id) {
    const activeAccessGrants = accessGrantKpi.data?.data.filter(isActiveAccessGrant) ?? [];

    kpiCards.push({
      label: 'Acesso/Auditoria (ativos)',
      value: activeAccessGrants.length,
      icon: 'ShieldCheck',
      accent: 'success',
    });
  }

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Servidor excluído.');
      router.push('/rh');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'RH Magistério' },
          { label: 'Servidores', href: '/rh' },
          { label: member?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !member ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Servidor não encontrado ou indisponível.{' '}
              <Link href="/rh" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/rh" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        {member.name}
                      </h1>
                      <StaffMemberStatusBadge status={member.status} />
                    </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                      {member.role_title ?? 'Sem cargo definido'}
                      {member.registration_number ? ` · Mat. ${member.registration_number}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/rh/${id}/editar`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </div>

              <StatCards stats={kpiCards} loading={kpiLoading} />

              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="contratos">Contratos</TabsTrigger>
                  <TabsTrigger value="frequencia">Frequência</TabsTrigger>
                  <TabsTrigger value="remocoes">Remoções</TabsTrigger>
                  <TabsTrigger value="acesso-auditoria">Acesso/Auditoria</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados pessoais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="ID" value={member.id} />
                        <DetailField label="Tenant" value={member.tenant_id} />
                        <DetailField label="Usuário vinculado" value={member.user_id ?? '—'} />
                        <DetailField
                          label="CPF"
                          value={member.cpf ? formatCpf(member.cpf) : null}
                        />
                        <DetailField label="Matrícula funcional" value={member.registration_number} />
                        <DetailField label="Nome completo" value={member.name} />
                        <DetailField
                          label="Situação"
                          value={<StaffMemberStatusBadge status={member.status} />}
                        />
                        <DetailField label="Data de admissão" value={formatDate(member.admission_date)} />
                        <DetailField label="Cargo / função" value={member.role_title} />
                        <DetailField
                          label="Criado em"
                          value={formatDateTime(member.created_at)}
                        />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(member.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={member.deleted_at ? formatDateTime(member.deleted_at) : null}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contratos">
                  <StaffContractsTab staffMemberId={id} />
                </TabsContent>

                <TabsContent value="frequencia">
                  <StaffAttendanceTab staffUserId={userId} />
                </TabsContent>

                <TabsContent value="remocoes">
                  <StaffRemovalsTab staffUserId={userId} />
                </TabsContent>

                <TabsContent value="acesso-auditoria">
                  <StaffAccessGrantsTab staffUserId={userId} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <StaffAuditTab member={member} />
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
        title="Excluir servidor?"
        description={
          member ? `O servidor "${member.name}" será excluído.` : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
