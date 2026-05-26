import type { Metadata } from 'next';
import { LmsQuestionsPage } from '@/features/lms-questions/lms-questions-page';

export const metadata: Metadata = { title: 'Questões · AVA / LMS' };

export default function QuestoesPage() {
  return <LmsQuestionsPage />;
}
