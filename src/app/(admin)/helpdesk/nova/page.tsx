import type { Metadata } from 'next';
import { TicketFormPage } from '@/features/tickets/ticket-form';

export const metadata: Metadata = { title: 'Novo chamado · HelpDesk' };

export default function NovoChamadoPage() {
  return <TicketFormPage />;
}
