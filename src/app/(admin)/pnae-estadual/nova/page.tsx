import type { Metadata } from 'next';
import { StateMealProgramFormPage } from '@/features/state-meal-programs/state-meal-program-form';

export const metadata: Metadata = { title: 'Novo programa · PNAE Estadual' };

export default function NovoProgramaPage() {
  return <StateMealProgramFormPage />;
}
