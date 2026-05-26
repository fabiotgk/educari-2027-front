import type { Metadata } from 'next';
import { QuizAttemptsPage } from '@/features/quiz-attempts/quiz-attempts-page';

export const metadata: Metadata = { title: 'Tentativas · AVA / LMS' };

export default function TentativasPage() {
  return <QuizAttemptsPage />;
}
