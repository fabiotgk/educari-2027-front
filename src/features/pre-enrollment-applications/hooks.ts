'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteResource,
  getResource,
  listResource,
  updateResource,
  type ListParams,
} from '@/lib/api-client';
import type { PreEnrollmentApplication } from './types';

const RESOURCE = 'pre-enrollment-applications';
const KEY = ['pre-enrollment-applications'] as const;

/** Lista paginada de inscrições. */
export function usePreEnrollmentApplications(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<PreEnrollmentApplication>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Uma inscrição por id. */
export function usePreEnrollmentApplication(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<PreEnrollmentApplication>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useUpdatePreEnrollmentApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<PreEnrollmentApplication>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletePreEnrollmentApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Exclusão em massa. */
export function useDeletePreEnrollmentApplications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
