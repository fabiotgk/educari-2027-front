import type { Metadata } from 'next';
import { TransferEventFormPage } from '@/features/transfer-events/transfer-event-form';

export const metadata: Metadata = { title: 'Novo evento · Concurso de Remoção' };

export default function NovoRemocaoPage() {
  return <TransferEventFormPage />;
}
