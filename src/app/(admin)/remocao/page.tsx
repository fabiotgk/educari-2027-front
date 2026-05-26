import type { Metadata } from 'next';
import { TransferEventsPage } from '@/features/transfer-events/transfer-events-page';

export const metadata: Metadata = { title: 'Concurso de Remoção · M17' };

export default function RemocaoPage() {
  return <TransferEventsPage />;
}
