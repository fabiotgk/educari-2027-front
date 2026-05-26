import type { Metadata } from 'next';
import { OpenCoursesPage } from '@/features/open-courses/open-courses-page';

export const metadata: Metadata = { title: 'Cursos Livres · M38' };

/**
 * M38 / Cursos Livres — Lista de cursos livres.
 * Ver front/docs/CRUD-PATTERN.md.
 */
export default function CursosLivresPage() {
  return <OpenCoursesPage />;
}
