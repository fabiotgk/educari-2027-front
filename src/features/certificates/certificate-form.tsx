'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { Field } from '@/components/form/field';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { applyApiErrors } from '@/lib/form';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  buildCertificatePayload,
  certificateSchema,
  certificateToForm,
  emptyCertificateForm,
  type CertificateFormValues,
} from './schema';
import { useCertificate, useCreateCertificate, useUpdateCertificate } from './hooks';

export function CertificateFormPage({ certificateId, courseEnrollmentId }: { certificateId?: string; courseEnrollmentId?: string }) {
  const router = useRouter();
  const isEdit = Boolean(certificateId);
  const detail = useCertificate(certificateId ?? '');
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: { ...emptyCertificateForm, course_enrollment_id: courseEnrollmentId ?? '' },
  });
  const { register, formState: { errors } } = form;
  const create = useCreateCertificate();
  const update = useUpdateCertificate();
  const submitting = create.isPending || update.isPending;

  React.useEffect(() => {
    if (isEdit && detail.data) form.reset(certificateToForm(detail.data));
  }, [detail.data, form, isEdit]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = buildCertificatePayload(values);
      if (isEdit && certificateId) {
        await update.mutateAsync({ id: certificateId, body: payload });
        toastSuccess('Certificado atualizado com sucesso.');
        router.push(`/ava/certificados/${certificateId}`);
      } else {
        const created = await create.mutateAsync(payload);
        toastSuccess('Certificado criado com sucesso.');
        router.push(`/ava/certificados/${created.id}`);
      }
    } catch (err) {
      if (!applyApiErrors(err, form.setError)) toastError(err);
    }
  });

  const backHref = isEdit ? `/ava/certificados/${certificateId}` : courseEnrollmentId ? `/ava/matriculas/${courseEnrollmentId}` : '/ava/certificados';

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Certificados', href: '/ava/certificados' }, { label: isEdit ? 'Editar' : 'Novo certificado' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon-sm" asChild><Link href={backHref} aria-label="Voltar"><ArrowLeft /></Link></Button>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? 'Editar certificado' : 'Novo certificado'}</h1>
                <p className="text-sm text-muted-foreground">Emita ou ajuste o certificado vinculado à matrícula do curso.</p>
              </div>
            </div>
            {isEdit && detail.isLoading ? <Skeleton className="h-72 w-full rounded-xl" /> : (
              <Card>
                <CardHeader><CardTitle className="text-base">Certificado</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Matrícula do curso (UUID)" htmlFor="course_enrollment_id" required error={errors.course_enrollment_id?.message}>
                    <Input id="course_enrollment_id" {...register('course_enrollment_id')} aria-invalid={!!errors.course_enrollment_id} />
                  </Field>
                  <Field label="Código do certificado" htmlFor="certificate_code" required error={errors.certificate_code?.message}>
                    <Input id="certificate_code" {...register('certificate_code')} aria-invalid={!!errors.certificate_code} />
                  </Field>
                  <Field label="Emitido em" htmlFor="issued_at" error={errors.issued_at?.message}>
                    <Input id="issued_at" type="datetime-local" {...register('issued_at')} aria-invalid={!!errors.issued_at} />
                  </Field>
                  <Field label="Carga horária" htmlFor="workload_hours" error={errors.workload_hours?.message}>
                    <Input id="workload_hours" type="number" min={1} step={1} {...register('workload_hours')} aria-invalid={!!errors.workload_hours} />
                  </Field>
                  <Field label="URL de verificação" htmlFor="verification_url" error={errors.verification_url?.message} className="sm:col-span-2">
                    <Input id="verification_url" {...register('verification_url')} aria-invalid={!!errors.verification_url} placeholder="https://..." />
                  </Field>
                  <Field label="URL do PDF" htmlFor="pdf_url" error={errors.pdf_url?.message} className="sm:col-span-2">
                    <Input id="pdf_url" {...register('pdf_url')} aria-invalid={!!errors.pdf_url} placeholder="https://..." />
                  </Field>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="border-t bg-background"><div className="flex items-center justify-end gap-2 px-6 py-4 lg:px-8">
            <Button type="button" variant="outline" asChild><Link href={backHref}>Cancelar</Link></Button>
            <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="animate-spin" />}{isEdit ? 'Salvar alterações' : 'Criar certificado'}</Button>
          </div></div>
        </form>
      </main>
    </>
  );
}
