'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatCnpj, formatDateTime } from '@/lib/format';
import { maskCep, maskPhone } from '@/lib/masks';
import { toastError, toastSuccess } from '@/lib/toast';
import { SchoolStatusBadge } from './columns';
import { SchoolEnrollmentsTab } from './enrollments-tab';
import { SCHOOL_PROFILE_LABELS, SCHOOL_TYPE_LABELS } from './types';
import { useDeleteSchool, useSchool } from './hooks';

export function SchoolDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: school, isLoading, isError } = useSchool(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteSchool();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Escola excluída.');
      router.push('/cadastros');
    } catch (err) {
      toastError(err);
    }
  };

  const addr = school?.address;
  const idebEntries = school?.ideb_targets ? Object.entries(school.ideb_targets) : [];

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
              {/* Cabeçalho */}
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
                      {addr?.cidade ? ` · ${addr.cidade}${addr.uf ? '/' + addr.uf : ''}` : ''}
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
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </div>

              {/* Abas */}
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="endereco">Endereço e localização</TabsTrigger>
                  <TabsTrigger value="perfis">Perfis e metas</TabsTrigger>
                  <TabsTrigger value="matriculas">Matrículas</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Identificação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Tipo" value={<Badge variant="secondary">{SCHOOL_TYPE_LABELS[school.type]}</Badge>} />
                        <DetailField label="Situação" value={<SchoolStatusBadge status={school.operation_status} />} />
                        <DetailField label="Código interno" value={school.code} />
                        <DetailField label="Código INEP" value={school.inep_code} />
                        <DetailField label="CNPJ" value={school.cnpj ? formatCnpj(school.cnpj) : null} />
                        <DetailField label="Inscrição estadual" value={school.state_registration} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contato</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid>
                        <DetailField label="E-mail" value={school.email} />
                        <DetailField label="Telefone" value={school.phone ? maskPhone(school.phone) : null} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="endereco">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Endereço e localização</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="CEP" value={addr?.cep ? maskCep(addr.cep) : null} />
                        <DetailField label="Região / zona" value={school.region} />
                        <DetailField label="Município" value={addr?.cidade ? `${addr.cidade}${addr.uf ? '/' + addr.uf : ''}` : null} />
                        <DetailField
                          label="Logradouro"
                          full
                          value={addr?.logradouro ? `${addr.logradouro}${addr.numero ? ', ' + addr.numero : ''}` : null}
                        />
                        <DetailField label="Bairro" value={addr?.bairro} />
                        <DetailField
                          label="Coordenadas"
                          value={
                            school.coordinates?.lat != null && school.coordinates?.lng != null
                              ? `${school.coordinates.lat}, ${school.coordinates.lng}`
                              : null
                          }
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="perfis">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Perfis e metas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Perfis da escola</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {school.profiles?.length ? (
                            school.profiles.map((p) => (
                              <Badge key={p} variant="outline">
                                {SCHOOL_PROFILE_LABELS[p]}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Nenhum perfil específico.</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Metas IDEB</p>
                        {idebEntries.length ? (
                          <DetailGrid cols={3}>
                            {idebEntries.map(([year, target]) => (
                              <DetailField key={year} label={year} value={String(target)} />
                            ))}
                          </DetailGrid>
                        ) : (
                          <p className="mt-1.5 text-sm text-muted-foreground">Nenhuma meta cadastrada.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="matriculas">
                  <SchoolEnrollmentsTab schoolId={id} />
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
                        <DetailField label="Excluída em" value={school.deleted_at ? formatDateTime(school.deleted_at) : null} />
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
