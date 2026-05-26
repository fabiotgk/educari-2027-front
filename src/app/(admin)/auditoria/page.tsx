import type { Metadata } from 'next';
import { AccessGrantsPage } from '@/features/access-grants/access-grants-page';

export const metadata: Metadata = { title: 'Concessões · Acesso e Auditoria' };

/**
 * M26 / Acesso e Auditoria — Concessões de acesso.
 * Tela CRUD completa seguindo o padrão do front/docs/CRUD-PATTERN.md.
 */
export default function AuditoriaPage() {
  return <AccessGrantsPage />;
}
