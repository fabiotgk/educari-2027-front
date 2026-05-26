import { SiteDetailPage } from '@/features/sites/site-detail';

export default async function PortalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SiteDetailPage id={id} />;
}
