import { useQuery } from '@tanstack/react-query';

import { getResource, listResource, type ListParams } from '@/lib/api-client';
import type { ClassAttendance } from './types';

const RESOURCE = 'class-attendances';
const KEY = ['class-attendances'] as const;

export function useClassAttendances(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<ClassAttendance>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

export function useClassAttendance(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<ClassAttendance>(RESOURCE, id),
    enabled: Boolean(id),
  });
}
