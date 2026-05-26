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
import type { FacialEnrollment } from './types';

const RESOURCE = 'facial-enrollments';
const KEY = ['facial-enrollments'] as const;

/** Lista paginada de cadastros faciais (com filtros/busca/cursor). */
export function useFacialEnrollments(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<FacialEnrollment>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Um cadastro facial por id (páginas de detalhe e edição). */
export function useFacialEnrollment(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<FacialEnrollment>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateFacialEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      createResource<FacialEnrollment>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateFacialEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Record<string, unknown>;
    }) => updateResource<FacialEnrollment>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteFacialEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Exclusão em massa (ações em massa da tabela). */
export function useDeleteFacialEnrollments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
