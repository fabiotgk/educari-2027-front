import type { Metadata } from 'next';
import { TrainingCourseFormPage } from '@/features/training-courses/training-course-form';

export const metadata: Metadata = { title: 'Novo curso · Capacitação' };

export default function NovoCapacitacaoPage() {
  return <TrainingCourseFormPage />;
}
