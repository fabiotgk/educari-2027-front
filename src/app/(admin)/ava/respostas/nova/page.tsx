import type { Metadata } from 'next';
import { QuizAnswerFormPage } from '@/features/quiz-answers/quiz-answer-form';

export const metadata: Metadata = { title: 'Nova resposta · AVA / LMS' };

export default function NovaRespostaPage() {
  return <QuizAnswerFormPage />;
}
