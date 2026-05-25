import type { Metadata } from 'next';
import { GuardianFormPage } from '@/features/guardians/guardian-form';

export const metadata: Metadata = { title: 'Novo responsável · Responsáveis' };

export default function NovoResponsavelPage() {
  return <GuardianFormPage />;
}
