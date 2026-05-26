import { LessonMaterialFormPage } from '@/features/lesson-materials/lesson-material-form';

export default async function EditarMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonMaterialFormPage materialId={id} />;
}
