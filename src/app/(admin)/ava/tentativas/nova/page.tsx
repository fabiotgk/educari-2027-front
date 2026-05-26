import type { Metadata } from 'next';
import { QuizAttemptFormPage } from '@/features/quiz-attempts/quiz-attempt-form';

export const metadata: Metadata = { title: 'Nova tentativa · AVA / LMS' };

export default function NovaTentativaPage() {
  return <QuizAttemptFormPage />;
}
