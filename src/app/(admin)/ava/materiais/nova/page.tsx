import type { Metadata } from 'next';
import { LessonMaterialFormPage } from '@/features/lesson-materials/lesson-material-form';

export const metadata: Metadata = { title: 'Novo material · AVA / LMS' };

export default function NovoMaterialPage() {
  return <LessonMaterialFormPage />;
}
