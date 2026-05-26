'use client';

import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';
import type {
  AttendanceSummary,
  EnrollmentBySchool,
  EvasionSummary,
  InsightsOverview,
} from './types';

const INSIGHTS_KEY = ['insights'] as const;

function fetchInsight<T>(path: string): Promise<{ data: T }> {
  return apiFetch<{ data: T }>(path);
}

export function useInsightsOverview() {
  return useQuery({
    queryKey: [...INSIGHTS_KEY, 'overview'],
    queryFn: () => fetchInsight<InsightsOverview>('/api/v1/insights/overview'),
    select: (res) => res.data,
  });
}

export function useEnrollmentsBySchool() {
  return useQuery({
    queryKey: [...INSIGHTS_KEY, 'enrollments-by-school'],
    queryFn: () =>
      fetchInsight<EnrollmentBySchool[]>('/api/v1/insights/enrollments-by-school'),
    select: (res) => res.data,
  });
}

export function useAttendanceSummary() {
  return useQuery({
    queryKey: [...INSIGHTS_KEY, 'attendance-summary'],
    queryFn: () => fetchInsight<AttendanceSummary>('/api/v1/insights/attendance-summary'),
    select: (res) => res.data,
  });
}

export function useEvasion() {
  return useQuery({
    queryKey: [...INSIGHTS_KEY, 'evasion'],
    queryFn: () => fetchInsight<EvasionSummary>('/api/v1/insights/evasion'),
    select: (res) => res.data,
  });
}
