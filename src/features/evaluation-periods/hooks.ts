import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  type ListParams,
  updateResource,
} from '@/lib/api-client';
import type { EvaluationPeriod } from './types';

const RESOURCE = 'evaluation-periods';
const KEY = ['evaluation-periods'] as const;

export function useEvaluationPeriods(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<EvaluationPeriod>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

export function useEvaluationPeriod(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<EvaluationPeriod>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateEvaluationPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<EvaluationPeriod>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateEvaluationPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; body: Record<string, unknown> }) =>
      updateResource<EvaluationPeriod>(RESOURCE, params.id, params.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteEvaluationPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteEvaluationPeriods() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

