import type { Metadata } from 'next';
import { LmsQuestionFormPage } from '@/features/lms-questions/lms-question-form';

export const metadata: Metadata = { title: 'Nova questão · AVA / LMS' };

export default function NovaQuestaoPage() {
  return <LmsQuestionFormPage />;
}
