import type { Metadata } from 'next';
import { StudentsPage } from '@/features/students/students-page';

export const metadata: Metadata = { title: 'Alunos · Matrículas' };

/**
 * M03 / Matrículas — Alunos. Tela CRUD de alunos seguindo o padrão
 * definido em front/docs/CRUD-PATTERN.md.
 */
export default function AlunosPage() {
  return <StudentsPage />;
}
