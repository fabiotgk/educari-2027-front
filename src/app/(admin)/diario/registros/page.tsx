import type { Metadata } from 'next';
import { TeachingRecordsPage } from '@/features/teaching-records/teaching-records-page';

export const metadata: Metadata = { title: 'Registros de aula · Diário Online' };

export default function RegistrosAulaPage() {
  return <TeachingRecordsPage />;
}

