import { LearningPathFormPage } from '@/features/learning-paths/learning-path-form';

export default async function EditarTrilhaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LearningPathFormPage resourceId={id} />;
}
