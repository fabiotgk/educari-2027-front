import type { Metadata } from 'next';
import { LessonPlansPage } from '@/features/lesson-plans/lesson-plans-page';

export const metadata: Metadata = { title: 'Planos de aula · Diário Online' };

export default function PlanosDeAulaPage() {
  return <LessonPlansPage />;
}

