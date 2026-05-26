import { CertificateDetailPage } from '@/features/certificates/certificate-detail';

export default async function CertificadoAvaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CertificateDetailPage id={id} />;
}
