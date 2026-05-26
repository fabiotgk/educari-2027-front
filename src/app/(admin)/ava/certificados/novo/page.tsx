import type { Metadata } from 'next';
import { CertificateFormPage } from '@/features/certificates/certificate-form';

export const metadata: Metadata = { title: 'Novo certificado · AVA / LMS' };

export default async function NovoCertificadoAvaPage({
  searchParams,
}: {
  searchParams: Promise<{ course_enrollment_id?: string }>;
}) {
  const { course_enrollment_id: courseEnrollmentId } = await searchParams;
  return <CertificateFormPage courseEnrollmentId={courseEnrollmentId} />;
}
