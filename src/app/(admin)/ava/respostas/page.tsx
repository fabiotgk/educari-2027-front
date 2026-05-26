import type { Metadata } from 'next';
import { QuizAnswersPage } from '@/features/quiz-answers/quiz-answers-page';

export const metadata: Metadata = { title: 'Respostas · AVA / LMS' };

export default function RespostasPage() {
  return <QuizAnswersPage />;
}
