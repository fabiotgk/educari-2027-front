import { PortalGradesPage } from '@/features/portal/portal-grades-page';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PortalGradesPage studentId={id} />;
}
