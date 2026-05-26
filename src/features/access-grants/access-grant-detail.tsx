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
import { formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  SCOPE_TYPE_LABELS,
  STATUS_LABELS,
  type AccessGrant,
  type AccessGrantStatus,
} from './types';
import { useDeleteAccessGrant, useAccessGrant } from './hooks';

function deriveStatus(ag: AccessGrant): AccessGrantStatus {
  if (ag.revoked_at) return 'revoked';
  const now = new Date();
  if (ag.expires_at && new Date(ag.expires_at) < now) return 'expired';
  if (ag.starts_at && new Date(ag.starts_at) > now) return 'pending';
  return 'active';
}

export function AccessGrantDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: grant, isLoading, isError } = useAccessGrant(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteAccessGrant();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Concessão de acesso excluída.');
      router.push('/auditoria');
    } catch (err) {
      toastError(err);
    }
  };

  const status = grant ? deriveStatus(grant) : null;

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Acesso e Auditoria' },
          { label: 'Concessões', href: '/auditoria' },
          { label: grant ? grant.role : 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !grant ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Concessão de acesso não encontrada ou indisponível.{' '}
              <Link href="/auditoria" className="underline">
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
                    <Link href="/auditoria" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{grant.role}</h1>
                      {status && (
                        <Badge
                          variant="outline"
                          className={
                            status === 'active'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                              : status === 'revoked'
                                ? 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                                : status === 'expired'
                                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                                  : 'border-sky-500/30 bg-sky-500/10 text-sky-700'
                          }
                        >
                          {STATUS_LABELS[status]}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {grant.user?.name ?? grant.user_id}
                      {grant.user?.email ? ` · ${grant.user.email}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/auditoria/${id}/editar`}>
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
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do acesso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Usuário" value={grant.user?.name ?? grant.user_id} />
                        <DetailField label="E-mail do usuário" value={grant.user?.email} />
                        <DetailField label="Papel (role)" value={grant.role} />
                        <DetailField
                          label="Tipo de escopo"
                          value={
                            grant.scope_type ? (
                              <Badge variant="secondary">{SCOPE_TYPE_LABELS[grant.scope_type]}</Badge>
                            ) : null
                          }
                        />
                        <DetailField label="ID do escopo" value={grant.scope_id} />
                        <DetailField
                          label="Concedido por"
                          value={grant.granted_by?.name ?? grant.granted_by_user_id}
                        />
                        <DetailField label="E-mail do concedente" value={grant.granted_by?.email} />
                        <DetailField label="Início da validade" value={formatDateTime(grant.starts_at)} />
                        <DetailField label="Expira em" value={formatDateTime(grant.expires_at)} />
                        <DetailField label="Revogado em" value={formatDateTime(grant.revoked_at)} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm">
                        {grant.notes ?? 'Nenhuma observação.'}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criada em" value={formatDateTime(grant.created_at)} />
                        <DetailField label="Atualizada em" value={formatDateTime(grant.updated_at)} />
                        <DetailField
                          label="Excluída em"
                          value={grant.deleted_at ? formatDateTime(grant.deleted_at) : null}
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
        title="Excluir concessão de acesso?"
        description={
          grant ? `A concessão de acesso para o papel "${grant.role}" será excluída.` : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
