import type { Metadata } from 'next';
import { LessonFormPage } from '@/features/lessons/lesson-form';

export const metadata: Metadata = { title: 'Nova aula · AVA / LMS' };

export default function NovaAulaPage() {
  return <LessonFormPage />;
}
