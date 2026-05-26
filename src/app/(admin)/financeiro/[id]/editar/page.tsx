import type { Metadata } from 'next';
import { FinancialProgramFormPage } from '@/features/financial-programs/financial-program-form';

export const metadata: Metadata = { title: 'Editar programa · Financeiro' };

export default async function EditarFinancialProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FinancialProgramFormPage programId={id} />;
}
