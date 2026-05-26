import { SchoolKitDetailPage } from '@/features/school-kits/school-kit-detail';

export default async function KitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SchoolKitDetailPage id={id} />;
}
