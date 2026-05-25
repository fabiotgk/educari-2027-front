import { SchoolDetailPage } from '@/features/schools/school-detail';

export default async function EscolaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SchoolDetailPage id={id} />;
}
