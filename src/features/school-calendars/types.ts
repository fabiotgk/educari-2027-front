/** Tipos do recurso M09 / Calendário Letivo — espelham SchoolCalendarResource do backend. */

export type CalendarEventKind =
  | 'school_day'
  | 'holiday'
  | 'recess'
  | 'event'
  | 'pedagogical_meeting'
  | 'evaluation_day';

export type HolidayScope = 'national' | 'state' | 'municipal';

export interface CalendarEvent {
  id: string;
  tenant_id: string;
  school_calendar_id: string;
  event_date: string | null;
  kind: CalendarEventKind;
  name: string;
  description: string | null;
  counts_as_school_day: boolean;
  is_recurring: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SchoolCalendar {
  id: string;
  tenant_id: string;
  school_id: string | null;
  academic_year: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  total_school_days_planned: number | null;
  total_school_days_actual: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  events?: CalendarEvent[];
}

export interface Holiday {
  id: string;
  tenant_id: string;
  name: string;
  scope: HolidayScope;
  recurring_month: number | null;
  recurring_day: number | null;
  specific_date: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export const CALENDAR_EVENT_KIND_LABELS: Record<CalendarEventKind, string> = {
  school_day: 'Dia letivo',
  holiday: 'Feriado',
  recess: 'Recesso',
  event: 'Evento',
  pedagogical_meeting: 'Reunião pedagógica',
  evaluation_day: 'Avaliação',
};

export const HOLIDAY_SCOPE_LABELS: Record<HolidayScope, string> = {
  national: 'Nacional',
  state: 'Estadual',
  municipal: 'Municipal',
};
