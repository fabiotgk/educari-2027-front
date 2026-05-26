import { SiteFormPage } from '@/features/sites/site-form';

export default async function EditarPortalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SiteFormPage siteId={id} />;
}
