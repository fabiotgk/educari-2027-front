import type { Metadata } from 'next';
import { SuppliersPage } from '@/features/suppliers/suppliers-page';

export const metadata: Metadata = { title: 'Fornecedores PNAE · Alimentação' };

export default function AlimentacaoPage() {
  return <SuppliersPage />;
}
