import type { Metadata } from 'next';
import { EvaluationPeriodsPage } from '@/features/evaluation-periods/evaluation-periods-page';

export const metadata: Metadata = { title: 'Períodos avaliativos · Diário Online' };

export default function PeriodosAvaliativosPage() {
  return <EvaluationPeriodsPage />;
}

