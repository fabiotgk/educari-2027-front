import type { Metadata } from 'next';
import { StateMealProgramsPage } from '@/features/state-meal-programs/state-meal-programs-page';

export const metadata: Metadata = { title: 'Programas · PNAE Estadual' };

/**
 * M36 / PNAE Estadual — Listagem de programas estaduais de alimentação escolar.
 */
export default function PnaeEstadualPage() {
  return <StateMealProgramsPage />;
}
