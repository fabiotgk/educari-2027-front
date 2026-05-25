import { SchoolCalendarDetailPage } from '@/features/school-calendars/school-calendar-detail';

export default async function CalendarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SchoolCalendarDetailPage id={id} />;
}
