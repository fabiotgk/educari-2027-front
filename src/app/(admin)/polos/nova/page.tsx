import type { Metadata } from 'next';
import { DistanceCenterFormPage } from '@/features/distance-centers/distance-center-form';

export const metadata: Metadata = { title: 'Novo polo EAD' };

export default function NovoPoloPage() {
  return <DistanceCenterFormPage />;
}
