import type { Metadata } from 'next';
import { LessonMaterialsPage } from '@/features/lesson-materials/lesson-materials-page';

export const metadata: Metadata = { title: 'Materiais · AVA / LMS' };

export default function MateriaisPage() {
  return <LessonMaterialsPage />;
}
