import { LessonPlanFormPage } from '@/features/lesson-plans/lesson-plan-form';

export default async function EditarPlanoAulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonPlanFormPage lessonPlanId={id} />;
}

