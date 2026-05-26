import type { Metadata } from 'next';
import { PdiPlanFormPage } from '@/features/pdi-plans/pdi-plan-form';

export const metadata: Metadata = { title: 'Novo PDI · Educação Especial' };

export default function NovoPdiPlanPage() {
  return <PdiPlanFormPage />;
}
