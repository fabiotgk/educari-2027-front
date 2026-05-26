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
import { LIBRARY_ITEM_KIND_LABELS } from './types';
import { useDeleteLibraryItem, useLibraryItem } from './hooks';
import { LibraryItemLoansTab } from './loans-tab';

export function LibraryItemDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: item, isLoading, isError } = useLibraryItem(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteLibraryItem();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Item excluído.');
      router.push('/biblioteca');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Biblioteca' },
          { label: 'Acervo', href: '/biblioteca' },
          { label: item?.title ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !item ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Item não encontrado ou indisponível.{' '}
              <Link href="/biblioteca" className="underline">
                Voltar à lista
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href="/biblioteca" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
                      <Badge variant="secondary">{LIBRARY_ITEM_KIND_LABELS[item.kind]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.author ?? 'Autor desconhecido'}
                      {item.publisher ? ` · ${item.publisher}` : ''}
                      {item.published_year ? ` · ${item.published_year}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/biblioteca/${id}/editar`}>
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
                  <TabsTrigger value="emprestimos">Empréstimos</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Dados do item</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Tipo"
                          value={
                            <Badge variant="secondary">
                              {LIBRARY_ITEM_KIND_LABELS[item.kind]}
                            </Badge>
                          }
                        />
                        <DetailField label="ISBN" value={item.isbn} />
                        <DetailField label="Código da prateleira" value={item.shelf_code} />
                        <DetailField label="Editora" value={item.publisher} />
                        <DetailField label="Ano de publicação" value={item.published_year} />
                        <DetailField label="ID da Biblioteca" value={item.library_id} />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Estoque</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Total de cópias" value={item.copies_total} />
                        <DetailField label="Disponíveis" value={item.copies_available} />
                        <DetailField
                          label="Emprestadas"
                          value={item.copies_total - item.copies_available}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="emprestimos">
                  <LibraryItemLoansTab libraryItemId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(item.created_at)} />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(item.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={item.deleted_at ? formatDateTime(item.deleted_at) : null}
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
        title="Excluir item?"
        description={item ? `O item "${item.title}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
