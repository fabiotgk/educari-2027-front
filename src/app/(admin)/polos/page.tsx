import type { Metadata } from 'next';
import { DistanceCentersPage } from '@/features/distance-centers/distance-centers-page';

export const metadata: Metadata = { title: 'Polos EAD' };

export default function PolosPage() {
  return <DistanceCentersPage />;
}
