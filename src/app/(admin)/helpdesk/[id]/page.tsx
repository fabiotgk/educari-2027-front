import { TicketDetailPage } from '@/features/tickets/ticket-detail';

export default async function HelpdeskTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailPage id={id} />;
}
