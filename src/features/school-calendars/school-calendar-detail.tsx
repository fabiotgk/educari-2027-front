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
import { toastError, toastSuccess } from '@/lib/toast';
import { CalendarPublishedBadge } from './columns';
import { CalendarEventsTab } from './calendar-events-tab';
import { useDeleteSchoolCalendar, useSchoolCalendar } from './hooks';

export function SchoolCalendarDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data: calendar, isLoading, isError } = useSchoolCalendar(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteSchoolCalendar();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Calendário excluído.');
      router.push('/calendario');
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Calendário', href: '/calendario' },
          { label: calendar?.name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !calendar ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Calendário não encontrado ou indisponível.{' '}
              <Link href="/calendario" className="underline">
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
                    <Link href="/calendario" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{calendar.name}</h1>
                      <CalendarPublishedBadge published={calendar.is_published} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ano letivo {calendar.academic_year}
                      {calendar.starts_at ? ` · Início ${formatDate(calendar.starts_at)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/calendario/${id}/editar`}>
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
                  <TabsTrigger value="eventos">Eventos</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Informações do calendário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Ano letivo" value={calendar.academic_year} />
                        <DetailField label="Situação" value={<CalendarPublishedBadge published={calendar.is_published} />} />
                        <DetailField label="ID da escola" value={calendar.school_id ?? 'Rede geral'} />
                        <DetailField label="Início" value={formatDate(calendar.starts_at)} />
                        <DetailField label="Término" value={formatDate(calendar.ends_at)} />
                        <DetailField
                          label="Dias letivos planejados"
                          value={calendar.total_school_days_planned != null ? String(calendar.total_school_days_planned) : null}
                        />
                        <DetailField
                          label="Dias letivos realizados"
                          value={calendar.total_school_days_actual != null ? String(calendar.total_school_days_actual) : null}
                        />
                        <DetailField
                          label="Publicado em"
                          value={calendar.published_at ? formatDateTime(calendar.published_at) : null}
                        />
                      </DetailGrid>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="eventos">
                  <CalendarEventsTab calendarId={id} />
                </TabsContent>

                <TabsContent value="auditoria">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Auditoria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField label="Criado em" value={formatDateTime(calendar.created_at)} />
                        <DetailField label="Atualizado em" value={formatDateTime(calendar.updated_at)} />
                        <DetailField
                          label="Excluído em"
                          value={calendar.deleted_at ? formatDateTime(calendar.deleted_at) : null}
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
        title="Excluir calendário?"
        description={calendar ? `O calendário "${calendar.name}" será excluído.` : undefined}
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
