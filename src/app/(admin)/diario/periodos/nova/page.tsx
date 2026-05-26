import type { Metadata } from 'next';
import { EvaluationPeriodFormPage } from '@/features/evaluation-periods/evaluation-period-form';

export const metadata: Metadata = { title: 'Novo período avaliativo · Diário Online' };

export default function NovaPeriodoAvaliativoPage() {
  return <EvaluationPeriodFormPage />;
}

