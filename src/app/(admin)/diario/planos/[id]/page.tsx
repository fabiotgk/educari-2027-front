import { LessonPlanDetailPage } from '@/features/lesson-plans/lesson-plan-detail';

export default async function PlanoAulaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LessonPlanDetailPage id={id} />;
}

