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
import type { AccessGrant } from './types';

const RESOURCE = 'access-grants';
const KEY = ['access-grants'] as const;

/** Lista paginada de concessões de acesso (com filtros/busca/cursor). */
export function useAccessGrants(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<AccessGrant>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Uma concessão de acesso por id (páginas de detalhe e edição). */
export function useAccessGrant(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<AccessGrant>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateAccessGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<AccessGrant>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAccessGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<AccessGrant>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAccessGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Exclusão em massa (ações em massa da tabela). */
export function useDeleteAccessGrants() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
