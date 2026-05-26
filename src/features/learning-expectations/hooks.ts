import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  type ListParams,
  updateResource,
} from '@/lib/api-client';
import type { LearningExpectation } from './types';

const RESOURCE = 'learning-expectations';
const KEY = ['learning-expectations'] as const;

export function useLearningExpectations(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<LearningExpectation>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

export function useLearningExpectation(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<LearningExpectation>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateLearningExpectation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<LearningExpectation>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLearningExpectation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { id: string; body: Record<string, unknown> }) =>
      updateResource<LearningExpectation>(RESOURCE, params.id, params.body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLearningExpectation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLearningExpectations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

