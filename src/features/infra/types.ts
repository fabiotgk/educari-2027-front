export type SystemMetricType = 'request_time' | 'requests_per_sec' | 'active_users' | 'visit_duration';

export interface SystemMetric {
  id: string;
  tenant_id: string;
  metric_type: SystemMetricType;
  value: number;
  recorded_at: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DbMetricsSnapshot {
  id: string;
  tenant_id: string;
  active_connections: number | null;
  queries_per_sec: number | null;
  avg_query_ms: number | null;
  captured_at: string;
  created_at: string;
  updated_at: string;
}

export interface UsageStat {
  id: string;
  tenant_id: string;
  feature: string;
  user_group: string | null;
  hits: number;
  period_bucket: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface BrowserStat {
  id: string;
  tenant_id: string;
  browser: string | null;
  screen_resolution: string | null;
  hits: number;
  period_bucket: string;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}
