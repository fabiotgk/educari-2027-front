import { LessonMaterialDetailPage } from '@/features/lesson-materials/lesson-material-detail';

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonMaterialDetailPage id={id} />;
}
