import type { Metadata } from 'next';
import { SchoolCalendarsPage } from '@/features/school-calendars/school-calendars-page';

export const metadata: Metadata = { title: 'Calendário Letivo' };

/** M09 / SchoolCalendar — Calendário Letivo. */
export default function CalendarioPage() {
  return <SchoolCalendarsPage />;
}
