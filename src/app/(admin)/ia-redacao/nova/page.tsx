import type { Metadata } from 'next';
import { EssayEvaluationFormPage } from '@/features/essay-evaluations/essay-evaluation-form';

export const metadata: Metadata = { title: 'Nova avaliação · IA Redação' };

export default function NovaAvaliacaoPage() {
  return <EssayEvaluationFormPage />;
}
