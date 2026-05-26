import type { Metadata } from 'next';
import { TransportCompanyFormPage } from '@/features/transport-companies/transport-company-form';

export const metadata: Metadata = { title: 'Nova empresa · Transporte Escolar' };

export default function NovaTransportCompanyPage() {
  return <TransportCompanyFormPage />;
}
