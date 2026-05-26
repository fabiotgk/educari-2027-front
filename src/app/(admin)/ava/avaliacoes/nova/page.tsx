import type { Metadata } from 'next';
import { LmsQuizFormPage } from '@/features/lms-quizzes/lms-quiz-form';

export const metadata: Metadata = { title: 'Nova avaliação · AVA / LMS' };

export default function NovaAvaliacaoPage() {
  return <LmsQuizFormPage />;
}
