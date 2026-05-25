import type { Metadata } from 'next';
import { GuardiansPage } from '@/features/guardians/guardians-page';

export const metadata: Metadata = { title: 'Responsáveis' };

/** M03 / Enrollment — Responsáveis. Lista de responsáveis cadastrados. */
export default function ResponsaveisPage() {
  return <GuardiansPage />;
}
