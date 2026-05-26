import type { Metadata } from 'next';
import { PdiPlansPage } from '@/features/pdi-plans/pdi-plans-page';

export const metadata: Metadata = { title: 'Planos PDI · Educação Especial' };

export default function PdiPlansRoute() {
  return <PdiPlansPage />;
}
