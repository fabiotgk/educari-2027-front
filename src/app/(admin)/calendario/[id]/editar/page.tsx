import { SchoolCalendarFormPage } from '@/features/school-calendars/school-calendar-form';

export default async function EditarCalendarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SchoolCalendarFormPage calendarId={id} />;
}
