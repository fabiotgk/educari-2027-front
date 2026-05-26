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
import { TransportCompanyActiveBadge } from './columns';
import { VehiclesTab } from './vehicles-tab';
import { useDeleteTransportCompany, useTransportCompany } from './hooks';

export function TransportCompanyDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: company, isLoading, isError } = useTransportCompany(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteTransportCompany();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Empresa excluída.');
      router.push('/transporte');
    } catch (err) {
      toastError(err);
    }
  };

  const addr = company?.address as Record<string, unknown> | null | undefined;

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Transporte Escolar' },
          { label: 'Empresas', href: '/transporte' },
          { label: company?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !company ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Empresa não encontrada ou indisponível.{' '}
              <Link href="/transporte" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/transporte" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        {company.name}
                      </h1>
                      <TransportCompanyActiveBadge isActive={company.is_active} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {company.cnpj ? formatCnpj(company.cnpj) : 'Sem CNPJ'}
                      {addr?.cidade ? ` · ${String(addr.cidade)}${addr.uf ? '/' + String(addr.uf) : ''}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/transporte/${id}/editar`}>
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
                  <TabsTrigger value="veiculos">Veículos</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Identificação e contato</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Situação"
                          value={<TransportCompanyActiveBadge isActive={company.is_active} />}
                        />
                        <DetailField
                          label="CNPJ"
                          value={company.cnpj ? formatCnpj(company.cnpj) : null}
                        />
                        <DetailField
                          label="Telefone"
                          value={company.phone ? maskPhone(company.phone) : null}
                        />
                        <DetailField label="E-mail" value={company.email} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  {addr && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Endereço</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DetailGrid cols={3}>
                          <DetailField
                            label="CEP"
                            value={addr.cep ? maskCep(String(addr.cep)) : null}
                          />
                          <DetailField
                            label="Município"
                            value={
                              addr.cidade
                                ? `${String(addr.cidade)}${addr.uf ? '/' + String(addr.uf) : ''}`
                                : null
                            }
                          />
                          <DetailField
                            label="Logradouro"
                            full
                            value={
                              addr.logradouro
                                ? `${String(addr.logradouro)}${addr.numero ? ', ' + String(addr.numero) : ''}`
                                : null
                            }
                          />
                          <DetailField label="Bairro" value={addr.bairro ? String(addr.bairro) : null} />
                        </DetailGrid>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="veiculos">
                  <VehiclesTab transportCompanyId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Criada em"
                          value={formatDateTime(company.created_at)}
                        />
                        <DetailField
                          label="Atualizada em"
                          value={formatDateTime(company.updated_at)}
                        />
                        <DetailField
                          label="Excluída em"
                          value={
                            company.deleted_at ? formatDateTime(company.deleted_at) : null
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
        title="Excluir empresa de transporte?"
        description={
          company ? `A empresa "${company.name}" será excluída.` : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
