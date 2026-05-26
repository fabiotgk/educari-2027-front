import type { Metadata } from 'next';
import { CourseFormPage } from '@/features/courses/course-form';

export const metadata: Metadata = { title: 'Novo curso · AVA / LMS' };

export default function NovoCursoPage() {
  return <CourseFormPage />;
}
