'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  type ListParams,
  updateResource,
} from '@/lib/api-client';
import type { Grade, GradeAuditLog } from './types';

const RESOURCE = 'grades';
const KEY = ['grades'] as const;

export function useGrades(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<Grade>(RESOURCE, params),
    placeholderData: (previousData) => previousData,
  });
}

export function useGrade(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<Grade>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<Grade>(RESOURCE, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; body: Record<string, unknown> }) =>
      updateResource<Grade>(RESOURCE, params.id, params.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useDeleteGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useDeleteGrades() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });
}

export function useGradeAuditLogs(params: ListParams) {
  return useQuery({
    queryKey: ['grade-audit-logs', params],
    queryFn: () => listResource<GradeAuditLog>('grade-audit-logs', params),
    enabled: Boolean(params.filter?.grade_id),
  });
}
