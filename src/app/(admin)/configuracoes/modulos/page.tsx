import type { Metadata } from 'next';
import { MarketplacePage } from '@/features/marketplace/marketplace-page';

export const metadata: Metadata = { title: 'Módulos · Configurações' };

export default function ModulosPage() {
  return <MarketplacePage />;
}
