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
import type { LibraryItem, Loan } from './types';

const RESOURCE = 'library-items';
const KEY = ['library-items'] as const;

/** Lista paginada de itens (com filtros/busca/cursor). */
export function useLibraryItems(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<LibraryItem>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Um item por id (páginas de detalhe e edição). */
export function useLibraryItem(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<LibraryItem>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

/** Empréstimos de um item específico. */
export function useLibraryItemLoans(libraryItemId: string) {
  return useQuery({
    queryKey: ['loans', 'by-item', libraryItemId],
    queryFn: () =>
      listResource<Loan>('loans', { filter: { library_item_id: libraryItemId }, limit: 100 }),
    enabled: Boolean(libraryItemId),
  });
}

export function useCreateLibraryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      createResource<LibraryItem>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLibraryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<LibraryItem>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLibraryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLibraryItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
