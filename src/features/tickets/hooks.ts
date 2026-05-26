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
import type { Ticket, TicketComment } from './types';

const RESOURCE = 'tickets';
const KEY = ['tickets'] as const;

/** Lista paginada de chamados (com filtros/busca/cursor). */
export function useTickets(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<Ticket>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Um chamado por id (páginas de detalhe e edição). */
export function useTicket(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<Ticket>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

/** Comentários de um chamado (rota aninhada: /tickets/{ticket}/comments). */
export function useTicketComments(ticketId: string) {
  return useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: () =>
      listResource<TicketComment>(`tickets/${ticketId}/comments`, { limit: 100 }),
    enabled: Boolean(ticketId),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<Ticket>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<Ticket>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteTickets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
