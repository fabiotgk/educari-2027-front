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
import type { DocumentTemplate } from './types';

const RESOURCE = 'document-templates';
const KEY = ['document-templates'] as const;

/** Lista paginada de templates. */
export function useDocumentTemplates(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<DocumentTemplate>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Um template por id. */
export function useDocumentTemplate(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<DocumentTemplate>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateDocumentTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      createResource<DocumentTemplate>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateDocumentTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<DocumentTemplate>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteDocumentTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Exclusão em massa. */
export function useDeleteDocumentTemplates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
