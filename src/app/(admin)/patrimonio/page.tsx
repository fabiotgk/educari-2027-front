import type { Metadata } from 'next';
import { AssetsPage } from '@/features/assets/assets-page';

export const metadata: Metadata = { title: 'Patrimônio · Bens' };

export default function PatrimonioPage() {
  return <AssetsPage />;
}
