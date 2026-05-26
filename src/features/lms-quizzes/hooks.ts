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
import type { LmsQuiz } from './types';

const RESOURCE = 'lms-quizzes';
const KEY = ['lms-quizzes'] as const;

export function useLmsQuizzes(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<LmsQuiz>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

export function useLmsQuiz(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<LmsQuiz>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateLmsQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<LmsQuiz>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLmsQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<LmsQuiz>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLmsQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLmsQuizzes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
