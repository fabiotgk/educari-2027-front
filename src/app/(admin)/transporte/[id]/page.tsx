import { TransportCompanyDetailPage } from '@/features/transport-companies/transport-company-detail';

export default async function TransportCompanyDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransportCompanyDetailPage id={id} />;
}
