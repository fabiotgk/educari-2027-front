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
import type { Student } from '@/features/students/types';
import type { LearningPath } from './types';

const RESOURCE = 'learning-paths';
const KEY = ['learning-paths'] as const;

/** Lista paginada de trilhas de aprendizagem (com filtros/busca/cursor). */
export function useLearningPaths(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<LearningPath>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Uma trilha por id (páginas de detalhe e edição). */
export function useLearningPath(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<LearningPath>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateLearningPath() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<LearningPath>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateLearningPath() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<LearningPath>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteLearningPath() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Exclusão em massa (ações em massa da tabela). */
export function useDeleteLearningPaths() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Lista de alunos para uso em selects (ex: formulário de trilha). */
export function useStudentOptions() {
  return useQuery({
    queryKey: ['students', 'options'],
    queryFn: () => listResource<Student>('students', { limit: 200 }),
    staleTime: 5 * 60 * 1000,
  });
}
