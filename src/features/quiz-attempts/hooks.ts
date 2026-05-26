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
import type { QuizAttempt } from './types';

const RESOURCE = 'quiz-attempts';
const KEY = ['quiz-attempts'] as const;

export function useQuizAttempts(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<QuizAttempt>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

export function useQuizAttempt(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<QuizAttempt>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateQuizAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<QuizAttempt>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateQuizAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<QuizAttempt>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteQuizAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteQuizAttempts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
