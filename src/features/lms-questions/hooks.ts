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
import type { LmsQuestion } from './types';

const RESOURCE = 'lms-questions';
const KEY = ['lms-questions'] as const;

export function useLmsQuestions(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<LmsQuestion>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

export function useLmsQuestion(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<LmsQuestion>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateLmsQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<LmsQuestion>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLmsQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<LmsQuestion>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLmsQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLmsQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
