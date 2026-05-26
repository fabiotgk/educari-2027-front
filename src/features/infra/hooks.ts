import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { listResource, type Paginated } from '@/lib/api-client';
import type { BrowserStat, DbMetricsSnapshot, SystemMetric, UsageStat } from './types';

const DEFAULT_LIMIT = 200;

const SYSTEM_METRICS_RESOURCE = 'system-metrics';
const USAGE_STATS_RESOURCE = 'usage-stats';
const BROWSER_STATS_RESOURCE = 'browser-stats';
const DB_SNAPSHOTS_RESOURCE = 'db-metrics-snapshots';

interface QueryOptions {
  enabled?: boolean;
  limit?: number;
}

function usePaginatedQuery<T>(resource: string, { enabled = true, limit = DEFAULT_LIMIT }: QueryOptions = {}) {
  return useQuery<Paginated<T>, Error>({
    queryKey: ['infra-monitoring', resource, limit, enabled],
    queryFn: () => listResource<T>(resource, { limit }),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useSystemMetricsQuery(
  options: QueryOptions = {},
): UseQueryResult<Paginated<SystemMetric>> {
  return usePaginatedQuery<SystemMetric>(SYSTEM_METRICS_RESOURCE, options);
}

export function useUsageStatsQuery(
  options: QueryOptions = {},
): UseQueryResult<Paginated<UsageStat>> {
  return usePaginatedQuery<UsageStat>(USAGE_STATS_RESOURCE, options);
}

export function useBrowserStatsQuery(
  options: QueryOptions = {},
): UseQueryResult<Paginated<BrowserStat>> {
  return usePaginatedQuery<BrowserStat>(BROWSER_STATS_RESOURCE, options);
}

export function useDbMetricsSnapshotsQuery(
  options: QueryOptions = {},
): UseQueryResult<Paginated<DbMetricsSnapshot>> {
  return usePaginatedQuery<DbMetricsSnapshot>(DB_SNAPSHOTS_RESOURCE, options);
}
