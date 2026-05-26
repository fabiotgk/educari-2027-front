import type { Metadata } from 'next';
import { SupplierFormPage } from '@/features/suppliers/supplier-form';

export const metadata: Metadata = { title: 'Novo fornecedor · Alimentação PNAE' };

export default function NovoFornecedorPage() {
  return <SupplierFormPage />;
}
