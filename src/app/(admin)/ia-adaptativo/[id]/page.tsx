import { LearningPathDetailPage } from '@/features/learning-paths/learning-path-detail';

export default async function TrilhaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LearningPathDetailPage id={id} />;
}
