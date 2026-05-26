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
import { formatCnpj, formatDateTime } from '@/lib/format';
import { maskCep, maskPhone } from '@/lib/masks';
import { toastError, toastSuccess } from '@/lib/toast';
import { SupplierStatusBadge } from './columns';
import { useDeleteSupplier, useSupplier } from './hooks';

export function SupplierDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: supplier, isLoading, isError } = useSupplier(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteSupplier();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Fornecedor excluído.');
      router.push('/alimentacao');
    } catch (err) {
      toastError(err);
    }
  };

  const addr = supplier?.address;

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Alimentação PNAE' },
          { label: 'Fornecedores', href: '/alimentacao' },
          { label: supplier?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !supplier ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Fornecedor não encontrado ou indisponível.{' '}
              <Link href="/alimentacao" className="underline">
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
                    <Link href="/alimentacao" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{supplier.name}</h1>
                      <SupplierStatusBadge active={supplier.is_active} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {supplier.is_regional ? 'Fornecedor Regional' : 'Fornecedor Geral'}
                      {supplier.cnpj ? ` · CNPJ: ${formatCnpj(supplier.cnpj)}` : ''}
                      {addr?.cidade ? ` · ${addr.cidade}${addr.uf ? '/' + addr.uf : ''}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/alimentacao/${id}/editar`}>
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
                  <TabsTrigger value="endereco">Endereço</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Identificação</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="CNPJ"
                          value={supplier.cnpj ? formatCnpj(supplier.cnpj) : null}
                        />
                        <DetailField
                          label="Fornecedor regional"
                          value={supplier.is_regional ? 'Sim' : 'Não'}
                        />
                        <DetailField
                          label="Situação"
                          value={<SupplierStatusBadge active={supplier.is_active} />}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contato</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid>
                        <DetailField label="E-mail" value={supplier.email} />
                        <DetailField
                          label="Telefone"
                          value={supplier.phone ? maskPhone(supplier.phone) : null}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="endereco">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Endereço</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="CEP"
                          value={addr?.cep ? maskCep(addr.cep) : null}
                        />
                        <DetailField
                          label="Município"
                          value={
                            addr?.cidade
                              ? `${addr.cidade}${addr.uf ? '/' + addr.uf : ''}`
                              : null
                          }
                        />
                        <DetailField label="Bairro" value={addr?.bairro} />
                        <DetailField
                          label="Logradouro"
                          full
                          value={
                            addr?.logradouro
                              ? `${addr.logradouro}${addr.numero ? ', ' + addr.numero : ''}`
                              : null
                          }
                        />
                      </DetailGrid>
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
                        <DetailField
                          label="Criado em"
                          value={formatDateTime(supplier.created_at)}
                        />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(supplier.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={
                            supplier.deleted_at ? formatDateTime(supplier.deleted_at) : null
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
        title="Excluir fornecedor?"
        description={
          supplier ? `O fornecedor "${supplier.name}" será excluído.` : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
