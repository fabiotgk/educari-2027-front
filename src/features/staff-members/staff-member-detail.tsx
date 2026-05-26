'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatCpf, formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { StaffMemberStatusBadge } from './columns';
import { StaffContractsTab } from './staff-contracts-tab';
import { useDeleteStaffMember, useStaffMember } from './hooks';

export function StaffMemberDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: member, isLoading, isError } = useStaffMember(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteStaffMember();

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

              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="contratos">Contratos</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados pessoais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="CPF"
                          value={member.cpf ? formatCpf(member.cpf) : null}
                        />
                        <DetailField
                          label="Matrícula funcional"
                          value={member.registration_number}
                        />
                        <DetailField label="Situação" value={<StaffMemberStatusBadge status={member.status} />} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Vínculo funcional</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid>
                        <DetailField label="Cargo / função" value={member.role_title} />
                        <DetailField
                          label="Data de admissão"
                          value={formatDate(member.admission_date)}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contratos">
                  <StaffContractsTab staffMemberId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
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
                          value={
                            member.deleted_at ? formatDateTime(member.deleted_at) : null
                          }
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
