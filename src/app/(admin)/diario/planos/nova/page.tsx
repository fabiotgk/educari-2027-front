import type { Metadata } from 'next';
import { LessonPlanFormPage } from '@/features/lesson-plans/lesson-plan-form';

export const metadata: Metadata = { title: 'Novo plano de aula · Diário Online' };

export default async function NovaAbaPlanoAulaPage({
  searchParams,
}: {
  searchParams: Promise<{ class_diary_id?: string; evaluation_period_id?: string }>;
}) {
  const { class_diary_id: classDiaryId, evaluation_period_id: evaluationPeriodId } = await searchParams;
  return <LessonPlanFormPage classDiaryId={classDiaryId} evaluationPeriodId={evaluationPeriodId} />;
}

