import { CertificateFormPage } from '@/features/certificates/certificate-form';

export default async function EditarCertificadoAvaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CertificateFormPage certificateId={id} />;
}
