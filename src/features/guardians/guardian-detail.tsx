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
import { formatDate, formatDateTime } from '@/lib/format';
import { maskPhone, maskCep } from '@/lib/masks';
import { toastError, toastSuccess } from '@/lib/toast';
import { useDeleteGuardian, useGuardian } from './hooks';

export function GuardianDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: guardian, isLoading, isError } = useGuardian(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteGuardian();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Responsável excluído.');
      router.push('/responsaveis');
    } catch (err) {
      toastError(err);
    }
  };

  const addr = guardian?.address;

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Responsáveis', href: '/responsaveis' },
          { label: guardian?.full_name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !guardian ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Responsável não encontrado ou indisponível.{' '}
              <Link href="/responsaveis" className="underline">
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
                    <Link href="/responsaveis" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{guardian.full_name}</h1>
                    {guardian.occupation && (
                      <p className="mt-1 text-sm text-muted-foreground">{guardian.occupation}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/responsaveis/${id}/editar`}>
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
                        <DetailField label="Data de nascimento" value={formatDate(guardian.birth_date)} />
                        <DetailField label="Profissão / Ocupação" value={guardian.occupation} />
                        <DetailField
                          label="Dados protegidos (PII)"
                          value={guardian.has_pii ? 'Sim — CPF/RG ocultos' : 'Não'}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Contato</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={2}>
                        <DetailField label="E-mail" value={guardian.email} />
                        <DetailField
                          label="Telefone principal"
                          value={guardian.phone_primary ? maskPhone(guardian.phone_primary) : null}
                        />
                        <DetailField
                          label="Telefone secundário"
                          value={guardian.phone_secondary ? maskPhone(guardian.phone_secondary) : null}
                        />
                        <DetailField
                          label="WhatsApp"
                          value={guardian.whatsapp ? maskPhone(guardian.whatsapp) : null}
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
                        <DetailField label="CEP" value={addr?.cep ? maskCep(addr.cep) : null} />
                        <DetailField
                          label="Município"
                          value={addr?.cidade ? `${addr.cidade}${addr.uf ? '/' + addr.uf : ''}` : null}
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
                        <DetailField label="Criado em" value={formatDateTime(guardian.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(guardian.updated_at)} />
                        <DetailField
                          label="Excluído em"
                          value={guardian.deleted_at ? formatDateTime(guardian.deleted_at) : null}
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
        title="Excluir responsável?"
        description={guardian ? `O responsável "${guardian.full_name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
