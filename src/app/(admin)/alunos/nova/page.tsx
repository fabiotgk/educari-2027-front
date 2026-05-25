import type { Metadata } from 'next';
import { StudentFormPage } from '@/features/students/student-form';

export const metadata: Metadata = { title: 'Novo aluno · Matrículas' };

export default function NovoAlunoPage() {
  return <StudentFormPage />;
}
