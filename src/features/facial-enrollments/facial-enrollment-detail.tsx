'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailGrid, DetailField } from '@/components/crud/detail-fields';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { formatDate, formatDateTime } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { FacialEnrollmentStatusBadge } from './columns';
import { useDeleteFacialEnrollment, useFacialEnrollment } from './hooks';

export function FacialEnrollmentDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useFacialEnrollment(id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const del = useDeleteFacialEnrollment();

  const runDelete = async () => {
    try {
      await del.mutateAsync(id);
      toastSuccess('Cadastro facial excluído.');
      router.push('/facial');
    } catch (err) {
      toastError(err);
    }
  };

  const enrollment = data;

  return (
    <>
      <Topbar
        breadcrumbs={[
          { label: 'Reconhecimento Facial' },
          { label: 'Cadastros', href: '/facial' },
          { label: enrollment?.student?.full_name ?? 'Detalhe' },
        ]}
      />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : isError || !enrollment ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Cadastro facial não encontrado ou indisponível.{' '}
              <Link href="/facial" className="underline">
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
                    <Link href="/facial" aria-label="Voltar">
                      <ArrowLeft />
                    </Link>
                  </Button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        {enrollment.student?.full_name ??
                          'Cadastro facial'}
                      </h1>
                      <FacialEnrollmentStatusBadge
                        status={enrollment.status}
                      />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {enrollment.photo_reference}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/facial/${id}/editar`}>
                      <Pencil /> Editar
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Trash2 /> Excluir
                  </Button>
                </div>
              </div>

              {/* Destaque LGPD */}
              <Card
                className={
                  enrollment.consent_given
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-amber-500/30 bg-amber-500/5'
                }
              >
                <CardContent className="flex items-center gap-3 py-4">
                  {enrollment.consent_given ? (
                    <ShieldCheck className="size-5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="size-5 text-amber-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {enrollment.consent_given
                        ? 'Consentimento concedido — dados tratados em conformidade com a LGPD.'
                        : 'Consentimento pendente — o uso da imagem não está autorizado até o responsável legal conceder o consentimento.'}
                    </p>
                    {enrollment.consent_at && (
                      <p className="text-xs text-muted-foreground">
                        Data do consentimento:{' '}
                        {formatDate(enrollment.consent_at)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Abas */}
              <Tabs defaultValue="resumo">
                <TabsList>
                  <TabsTrigger value="resumo">Resumo</TabsTrigger>
                  <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
                </TabsList>

                <TabsContent value="resumo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Dados do cadastro
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <DetailGrid cols={3}>
                        <DetailField
                          label="Aluno"
                          value={
                            enrollment.student?.full_name ??
                            enrollment.student_id
                          }
                        />
                        <DetailField
                          label="Status"
                          value={
                            <FacialEnrollmentStatusBadge
                              status={enrollment.status}
                            />
                          }
                        />
                        <DetailField
                          label="Referência da foto"
                          value={enrollment.photo_reference}
                        />
                        <DetailField
                          label="Hash do template"
                          value={enrollment.template_hash}
                        />
                        <DetailField
                          label="Data do cadastro"
                          value={formatDate(enrollment.enrolled_at)}
                        />
                        <DetailField
                          label="Consentimento"
                          value={
                            enrollment.consent_given ? (
                              <Badge variant="default">Concedido</Badge>
                            ) : (
                              <Badge variant="secondary">
                                Não concedido
                              </Badge>
                            )
                          }
                        />
                        <DetailField
                          label="Data do consentimento"
                          value={formatDate(enrollment.consent_at)}
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
                          value={formatDateTime(enrollment.created_at)}
                        />
                        <DetailField
                          label="Atualizado em"
                          value={formatDateTime(enrollment.updated_at)}
                        />
                        <DetailField
                          label="Excluído em"
                          value={
                            enrollment.deleted_at
                              ? formatDateTime(enrollment.deleted_at)
                              : null
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
        title="Excluir cadastro facial?"
        description={
          enrollment
            ? `O cadastro facial de "${
                enrollment.student?.full_name ?? enrollment.student_id
              }" será excluído.`
            : undefined
        }
        confirmLabel="Excluir"
        onConfirm={runDelete}
      />
    </>
  );
}
