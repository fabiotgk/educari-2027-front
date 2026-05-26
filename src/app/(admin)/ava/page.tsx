import type { Metadata } from 'next';
import { CoursesPage } from '@/features/courses/courses-page';

export const metadata: Metadata = { title: 'Cursos · AVA / LMS' };

export default function AvaPage() {
  return <CoursesPage />;
}
