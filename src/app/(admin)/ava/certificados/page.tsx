import type { Metadata } from 'next';
import { CertificatesPage } from '@/features/certificates/certificates-page';

export const metadata: Metadata = { title: 'Certificados · AVA / LMS' };

export default function CertificadosAvaPage() {
  return <CertificatesPage />;
}
