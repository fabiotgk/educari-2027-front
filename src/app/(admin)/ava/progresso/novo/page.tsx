import type { Metadata } from 'next';
import { LessonProgressFormPage } from '@/features/lesson-progress/lesson-progress-form';

export const metadata: Metadata = { title: 'Novo progresso · AVA / LMS' };

export default async function NovoProgressoAvaPage({
  searchParams,
}: {
  searchParams: Promise<{ course_enrollment_id?: string }>;
}) {
  const { course_enrollment_id: courseEnrollmentId } = await searchParams;
  return <LessonProgressFormPage courseEnrollmentId={courseEnrollmentId} />;
}
