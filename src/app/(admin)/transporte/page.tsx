import type { Metadata } from 'next';
import { TransportCompaniesPage } from '@/features/transport-companies/transport-companies-page';

export const metadata: Metadata = { title: 'Empresas · Transporte Escolar' };

export default function TransportCompaniesRoute() {
  return <TransportCompaniesPage />;
}
