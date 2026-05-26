import type { Metadata } from 'next';
import { LmsQuizzesPage } from '@/features/lms-quizzes/lms-quizzes-page';

export const metadata: Metadata = { title: 'Avaliações · AVA / LMS' };

export default function AvaliacoesPage() {
  return <LmsQuizzesPage />;
}
