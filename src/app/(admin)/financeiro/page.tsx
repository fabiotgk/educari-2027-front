import type { Metadata } from 'next';
import { FinancialProgramsPage } from '@/features/financial-programs/financial-programs-page';

export const metadata: Metadata = { title: 'Programas FNDE · Financeiro' };

export default function FinancialProgramsRoute() {
  return <FinancialProgramsPage />;
}
