import type { Metadata } from 'next';
import { SchoolCalendarFormPage } from '@/features/school-calendars/school-calendar-form';

export const metadata: Metadata = { title: 'Novo calendário · Calendário Letivo' };

export default function NovoCalendarioPage() {
  return <SchoolCalendarFormPage />;
}
