import type { Metadata } from 'next';
import { AssetFormPage } from '@/features/assets/asset-form';

export const metadata: Metadata = { title: 'Novo bem · Patrimônio' };

export default function NovoBemPage() {
  return <AssetFormPage />;
}
