import type { Metadata } from 'next';
import { PreEnrollmentsPage } from '@/features/pre-enrollment-applications/pre-enrollments-page';

export const metadata: Metadata = { title: 'Pré-Matrícula' };

/**
 * M02 / PreEnrollment — Inscrições de pré-matrícula.
 * Nota: criação de novas inscrições é feita via portal público.
 * Esta tela é para gestão/análise pelo administrador.
 */
export default function PreMatriculaPage() {
  return <PreEnrollmentsPage />;
}
