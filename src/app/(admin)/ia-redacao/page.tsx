import type { Metadata } from 'next';
import { EssayEvaluationsPage } from '@/features/essay-evaluations/essay-evaluations-page';

export const metadata: Metadata = { title: 'Avaliações de redação · IA Redação' };

/**
 * M29 / IA Avaliação Textual — Lista de avaliações de redação.
 */
export default function IaRedacaoPage() {
  return <EssayEvaluationsPage />;
}
