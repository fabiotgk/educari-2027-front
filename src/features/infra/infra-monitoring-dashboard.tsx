'use client';

import * as React from 'react';
import * as Icons from 'lucide-react';

import { Topbar } from '@/components/dashboard/topbar';
import { BarChart } from '@/components/dashboard/charts';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenant } from '@/lib/providers/tenant-provider';
import { toastError } from '@/lib/toast';
import { formatDate, formatNumber } from '@/lib/format';
import {
  useBrowserStatsQuery,
  useDbMetricsSnapshotsQuery,
  useSystemMetricsQuery,
  useUsageStatsQuery,
} from './hooks';
import { type BrowserStat, type DbMetricsSnapshot, type SystemMetric, type SystemMetricType } from './types';

interface BarDatum {
  label: string;
  value: number;
}

interface InfraKpi {
  label: string;
  value: string;
  icon: keyof typeof Icons;
  accent: 'primary' | 'success' | 'warning' | 'danger';
}

const METRIC_LABELS: Record<SystemMetricType, string> = {
  request_time: 'Tempo médio de resposta',
  requests_per_sec: 'Requisições por segundo',
  active_users: 'Usuários ativos',
  visit_duration: 'Duração média de sessão',
};

const METRIC_ICON: Record<SystemMetricType, keyof typeof Icons> = {
  request_time: 'Clock4',
  requests_per_sec: 'Activity',
  active_users: 'Users',
  visit_duration: 'Timer',
};

const METRIC_COLOR: Record<SystemMetricType, InfraKpi['accent']> = {
  request_time: 'warning',
  requests_per_sec: 'primary',
  active_users: 'success',
  visit_duration: 'warning',
};

function formatMetricValue(metricType: SystemMetricType, value: number): string {
  switch (metricType) {
    case 'request_time':
    case 'visit_duration':
      return `${formatNumber(value, 1)} ms`;
    case 'requests_per_sec':
      return `${formatNumber(value, 1)} / s`;
    case 'active_users':
      return formatNumber(value, 0);
    default:
      return formatNumber(value, 0);
  }
}

function deriveLatestSystemMetrics(
  metrics: SystemMetric[],
): Partial<Record<SystemMetricType, SystemMetric>> {
  const latest = {} as Partial<Record<SystemMetricType, SystemMetric>>;

  for (const metric of metrics) {
    if (!latest[metric.metric_type]) {
      latest[metric.metric_type] = metric;
    }
  }

  return latest;
}

interface UsageAgg {
  feature: string;
  hits: number;
}

function aggregateUsageByFeature(usageStats: UsageAgg[]): BarDatum[] {
  const map = new Map<string, number>();

  for (const item of usageStats) {
    map.set(item.feature, (map.get(item.feature) ?? 0) + item.hits);
  }

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({
      label,
      value,
    }));
}

function aggregateBrowserHits(stats: BrowserStat[]): BarDatum[] {
  const map = new Map<string, number>();

  for (const item of stats) {
    const key = item.browser ?? 'N/A';
    map.set(key, (map.get(key) ?? 0) + item.hits);
  }

  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({
      label,
      value,
    }));
}

function recentDbConnectionsTrend(snapshots: DbMetricsSnapshot[]): BarDatum[] {
  return snapshots
    .filter((snapshot) => snapshot.active_connections !== null)
    .slice(0, 8)
    .map((snapshot) => ({
      label: formatDate(snapshot.captured_at, 'HH:mm'),
      value: snapshot.active_connections ?? 0,
    }));
}

function LoadingSkeleton() {
  return (
    <main className="flex-1 overflow-auto bg-muted/30">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <Skeleton className="h-8 w-72" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Skeleton className="h-5 w-56" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full rounded-md" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Skeleton className="h-5 w-56" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full rounded-md" />
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                <Skeleton className="h-5 w-56" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-56 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

interface InfraDashboardState {
  loading: boolean;
  error: unknown;
  systemCards: InfraKpi[];
  dbCards: InfraKpi[];
  usageByFeature: BarDatum[];
  browserByHits: BarDatum[];
  dbTrend: BarDatum[];
  isEmpty: boolean;
}

function useInfraDashboardData(enabled: boolean): InfraDashboardState {
  const systemQuery = useSystemMetricsQuery({ enabled });
  const usageQuery = useUsageStatsQuery({ enabled });
  const browserQuery = useBrowserStatsQuery({ enabled });
  const dbQuery = useDbMetricsSnapshotsQuery({ enabled });

  const systemData = systemQuery.data?.data ?? [];
  const usageData = usageQuery.data?.data ?? [];
  const browserData = browserQuery.data?.data ?? [];
  const dbData = dbQuery.data?.data ?? [];

  const latestSystem = React.useMemo(
    () => deriveLatestSystemMetrics(systemData),
    [systemData],
  );

  const systemCards = React.useMemo<InfraKpi[]>(
    () =>
      (Object.entries(METRIC_LABELS) as [SystemMetricType, string][]).map(([type, label]) => {
        const metric = latestSystem[type];
        return {
          label,
          value: metric ? formatMetricValue(type, metric.value) : '—',
          icon: METRIC_ICON[type],
          accent: metric ? METRIC_COLOR[type] : 'danger',
        };
      }),
    [latestSystem],
  );

  const latestDbSnapshot = dbData[0] ?? null;

  const dbCards: InfraKpi[] = React.useMemo(
    () => [
      {
        label: 'Sessões ativas no banco',
        value: latestDbSnapshot?.active_connections != null
          ? formatNumber(latestDbSnapshot.active_connections, 0)
          : '—',
        icon: 'Database',
        accent: 'primary',
      },
      {
        label: 'Consultas por segundo',
        value: latestDbSnapshot?.queries_per_sec != null
          ? `${formatNumber(latestDbSnapshot.queries_per_sec, 2)} q/s`
          : '—',
        icon: 'LineChart',
        accent: 'success',
      },
      {
        label: 'Tempo médio da consulta',
        value: latestDbSnapshot?.avg_query_ms != null
          ? `${formatNumber(latestDbSnapshot.avg_query_ms, 2)} ms`
          : '—',
        icon: 'Timer',
        accent: 'warning',
      },
    ],
    [latestDbSnapshot],
  );

  const usageByFeature = React.useMemo(
    () => aggregateUsageByFeature(usageData),
    [usageData],
  );

  const browserByHits = React.useMemo(
    () => aggregateBrowserHits(browserData),
    [browserData],
  );

  const dbTrend = React.useMemo(() => recentDbConnectionsTrend(dbData), [dbData]);

  const loading = systemQuery.isLoading || usageQuery.isLoading || browserQuery.isLoading || dbQuery.isLoading;
  const error = systemQuery.error ?? usageQuery.error ?? browserQuery.error ?? dbQuery.error;

  const isEmpty =
    systemData.length === 0 &&
    usageData.length === 0 &&
    browserData.length === 0 &&
    dbData.length === 0;

  return {
    loading,
    error,
    systemCards,
    dbCards,
    usageByFeature,
    browserByHits,
    dbTrend,
    isEmpty,
  };
}

export function InfraMonitoringDashboard() {
  const { hasFeature, isModuleEnabled } = useTenant();
  const moduleEnabled =
    hasFeature('M27_infra_monitoring') || isModuleEnabled('M27');

  const {
    loading,
    error,
    systemCards,
    dbCards,
    usageByFeature,
    browserByHits,
    dbTrend,
    isEmpty,
  } = useInfraDashboardData(moduleEnabled);

  React.useEffect(() => {
    if (error) {
      toastError(error, 'Não foi possível carregar os dados de monitoramento de infraestrutura.');
    }
  }, [error]);

  if (!moduleEnabled) {
    return (
      <>
        <Topbar breadcrumbs={[{ label: 'Infra Monitoring' }]} />
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="space-y-6 p-6 lg:p-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Módulo não contratado</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                O módulo Infra Monitoring não está habilitado para este tenant.
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Topbar breadcrumbs={[{ label: 'Infra Monitoring' }]} />
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Infra Monitoring' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard de infraestrutura</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Indicadores de infraestrutura em tempo real por tenant.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[...systemCards, ...dbCards].map((card) => (
              <MetricCard
                key={card.label}
                label={card.label}
                value={card.value}
                icon={card.icon}
                accent={card.accent}
              />
            ))}
          </div>

          {isEmpty ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sem dados no momento</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ainda não há registros de monitoramento para o período atual. Verifique a rotina de
                coleta ou aguarde novos dados.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conexões ativas do banco (últimos registros)</CardTitle>
                </CardHeader>
                <CardContent>
                  {dbTrend.length > 0 ? (
                    <BarChart
                      title="Conexões ativas"
                      data={dbTrend}
                      suffix=" conexões"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados de conexão para exibir.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Funcionalidades mais acessadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {usageByFeature.length > 0 ? (
                    <BarChart title="Requisições por funcionalidade" data={usageByFeature} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados de uso para exibir.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Acessos por navegador</CardTitle>
                </CardHeader>
                <CardContent>
                  {browserByHits.length > 0 ? (
                    <BarChart title="Distribuição de acessos" data={browserByHits} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem dados de navegador para exibir.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
