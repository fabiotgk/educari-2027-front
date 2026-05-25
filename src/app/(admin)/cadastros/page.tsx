import type { Metadata } from 'next';
import { SchoolsPage } from '@/features/schools/schools-page';

export const metadata: Metadata = { title: 'Escolas · Cadastros' };

/**
 * M01 / Cadastros — Escolas. Tela de referência (piloto) do padrão CRUD.
 * Ver front/docs/CRUD-PATTERN.md.
 */
export default function CadastrosPage() {
  return <SchoolsPage />;
}
