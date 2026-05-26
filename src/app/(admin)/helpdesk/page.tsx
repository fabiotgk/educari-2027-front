import type { Metadata } from 'next';
import { TicketsPage } from '@/features/tickets/tickets-page';

export const metadata: Metadata = { title: 'Chamados · HelpDesk' };

export default function HelpdeskPage() {
  return <TicketsPage />;
}
