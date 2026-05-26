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
import type { CourseModule } from './types';

const RESOURCE = 'course-modules';
const KEY = ['course-modules'] as const;

export function useCourseModules(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<CourseModule>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

export function useCourseModule(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<CourseModule>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

export function useCreateCourseModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<CourseModule>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCourseModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<CourseModule>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCourseModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCourseModules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
