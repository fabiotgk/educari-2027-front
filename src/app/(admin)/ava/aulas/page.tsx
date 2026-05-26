import type { Metadata } from 'next';
import { LessonsPage } from '@/features/lessons/lessons-page';

export const metadata: Metadata = { title: 'Aulas · AVA / LMS' };

export default function AulasPage() {
  return <LessonsPage />;
}
