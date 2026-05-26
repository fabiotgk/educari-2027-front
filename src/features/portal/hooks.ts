'use client';

import { useQuery } from '@tanstack/react-query';

import { portalFetch, unwrapData } from '@/lib/portal-api';
import type {
  ApiEnvelope,
  PortalAnnouncement,
  PortalAttendanceRecord,
  PortalGrade,
  PortalMeResponse,
} from '@/features/portal/types';

export function usePortalMe(enabled: boolean) {
  return useQuery({
    queryKey: ['portal', 'me'],
    queryFn: async () =>
      unwrapData(await portalFetch<ApiEnvelope<PortalMeResponse>>('/api/v1/portal/me')),
    enabled,
  });
}

export function usePortalGrades(studentId: string) {
  return useQuery({
    queryKey: ['portal', 'students', studentId, 'grades'],
    queryFn: async () =>
      unwrapData(
        await portalFetch<ApiEnvelope<PortalGrade[]>>(`/api/v1/portal/students/${studentId}/grades`)
      ),
  });
}

export function usePortalAttendance(studentId: string) {
  return useQuery({
    queryKey: ['portal', 'students', studentId, 'attendance'],
    queryFn: async () =>
      unwrapData(
        await portalFetch<ApiEnvelope<PortalAttendanceRecord[]>>(
          `/api/v1/portal/students/${studentId}/attendance`
        )
      ),
  });
}

export function usePortalAnnouncements() {
  return useQuery({
    queryKey: ['portal', 'announcements'],
    queryFn: async () =>
      unwrapData(
        await portalFetch<ApiEnvelope<PortalAnnouncement[]>>('/api/v1/portal/announcements')
      ),
  });
}
