import type { Metadata } from 'next';
import { TransportCompanyFormPage } from '@/features/transport-companies/transport-company-form';

export const metadata: Metadata = { title: 'Editar empresa · Transporte Escolar' };

export default async function EditarTransportCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransportCompanyFormPage companyId={id} />;
}
