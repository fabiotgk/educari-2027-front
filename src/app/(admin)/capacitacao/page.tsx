import type { Metadata } from 'next';
import { TrainingCoursesPage } from '@/features/training-courses/training-courses-page';

export const metadata: Metadata = { title: 'Capacitação · M16' };

export default function CapacitacaoPage() {
  return <TrainingCoursesPage />;
}
