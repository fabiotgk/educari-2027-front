'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  updateResource,
  type ListParams,
} from '@/lib/api-client';
import type { CalendarEvent, Holiday, SchoolCalendar } from './types';

const RESOURCE = 'school-calendars';
const KEY = ['school-calendars'] as const;

/** Lista paginada de calendários. */
export function useSchoolCalendars(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<SchoolCalendar>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Um calendário por id. */
export function useSchoolCalendar(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<SchoolCalendar>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateSchoolCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      createResource<SchoolCalendar>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateSchoolCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<SchoolCalendar>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteSchoolCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Exclusão em massa. */
export function useDeleteSchoolCalendars() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Eventos de um calendário específico (via nested route). */
export function useCalendarEvents(calendarId: string) {
  return useQuery({
    queryKey: ['school-calendars', 'events', calendarId],
    queryFn: () =>
      listResource<CalendarEvent>(`school-calendars/${calendarId}/events`, { limit: 200 }),
    enabled: Boolean(calendarId),
  });
}

/** Lista de feriados do tenant. */
export function useHolidays(params?: ListParams) {
  return useQuery({
    queryKey: ['holidays', params],
    queryFn: () => listResource<Holiday>('holidays', params),
    placeholderData: (prev) => prev,
  });
}
