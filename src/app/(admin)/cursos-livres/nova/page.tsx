import type { Metadata } from 'next';
import { OpenCourseFormPage } from '@/features/open-courses/open-course-form';

export const metadata: Metadata = { title: 'Novo curso · Cursos Livres' };

export default function NovoCursoPage() {
  return <OpenCourseFormPage />;
}
