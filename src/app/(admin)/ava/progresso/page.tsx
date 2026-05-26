import type { Metadata } from 'next';
import { LessonProgressPage } from '@/features/lesson-progress/lesson-progress-page';

export const metadata: Metadata = { title: 'Progresso · AVA / LMS' };

export default function ProgressoAvaPage() {
  return <LessonProgressPage />;
}
