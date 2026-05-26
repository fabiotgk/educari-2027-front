import type { Metadata } from 'next';
import { FinancialProgramFormPage } from '@/features/financial-programs/financial-program-form';

export const metadata: Metadata = { title: 'Novo programa · Financeiro' };

export default function NovoFinancialProgramPage() {
  return <FinancialProgramFormPage />;
}
