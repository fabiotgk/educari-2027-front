import { TicketFormPage } from '@/features/tickets/ticket-form';

export default async function EditarChamadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketFormPage ticketId={id} />;
}
