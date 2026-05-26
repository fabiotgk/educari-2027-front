'use client';

import { useEffect } from 'react';

import { Topbar } from '@/components/dashboard/topbar';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { BarChart, ProgressList } from '@/components/dashboard/charts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAttendanceSummary,
  useEnrollmentsBySchool,
  useEvasion,
  useInsightsOverview,
} from '@/features/insights/hooks';
import { formatNumber, formatPercent } from '@/lib/format';
import { toastError } from '@/lib/toast';

export default function SecretaryDashboard() {
  const overviewQuery = useInsightsOverview();
  const enrollmentsBySchoolQuery = useEnrollmentsBySchool();
  const attendanceSummaryQuery = useAttendanceSummary();
  const evasionQuery = useEvasion();

  const firstError =
    overviewQuery.error ??
    enrollmentsBySchoolQuery.error ??
    attendanceSummaryQuery.error ??
    evasionQuery.error;

  useEffect(() => {
    if (firstError) {
      toastError(firstError, 'Não foi possível carregar os indicadores da visão geral.');
    }
  }, [firstError]);

  const overview = overviewQuery.data;
  const attendanceRate = attendanceSummaryQuery.data?.attendance_rate ?? overview?.attendance_rate;
  const evasionTotal = evasionQuery.data?.total ?? overview?.evasion_count;
  const enrollmentsBySchool = (enrollmentsBySchoolQuery.data ?? [])
    .map((row) => ({
      label: row.school_name ?? 'Escola sem nome',
      value: row.total,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Visão geral da rede' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Visão geral da rede</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Indicadores consolidados da rede municipal · Ano letivo 2026
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewQuery.isLoading ? (
              <MetricSkeletonCards />
            ) : overviewQuery.isError || !overview ? (
              <MetricsError />
            ) : (
              <>
                <MetricCard label="Total de alunos" value={formatNumber(overview.total_students)} icon="Users" accent="primary" index={0} />
                <MetricCard label="Escolas" value={formatNumber(overview.total_schools)} icon="Building2" accent="primary" index={1} />
                <MetricCard label="Servidores" value={formatNumber(overview.total_staff)} icon="GraduationCap" accent="primary" index={2} />
                <MetricCard label="Matrículas ativas" value={formatNumber(overview.active_enrollments)} icon="ClipboardList" accent="success" index={3} />
                <MetricCard label="Taxa de frequência" value={formatPercent(attendanceRate ?? 0)} icon="CalendarCheck" accent="success" index={4} />
                <MetricCard label="Evasão" value={formatNumber(evasionTotal ?? 0)} icon="UserX" accent="danger" index={5} />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {enrollmentsBySchoolQuery.isLoading ? (
                <Skeleton className="h-[304px] w-full rounded-xl" />
              ) : enrollmentsBySchoolQuery.isError ? (
                <ChartError title="Matrículas por escola" />
              ) : (
                <BarChart
                  title="Matrículas por escola"
                  subtitle="Escolas com mais matrículas registradas na rede"
                  data={enrollmentsBySchool}
                />
              )}
            </div>
            <div className="lg:col-span-1">
              {attendanceSummaryQuery.isLoading ? (
                <Skeleton className="h-[304px] w-full rounded-xl" />
              ) : attendanceSummaryQuery.isError ? (
                <ChartError title="Resumo de frequência" />
              ) : (
                <ProgressList
                  title="Resumo de frequência"
                  items={[
                    {
                      label: 'Presentes',
                      value: attendanceSummaryQuery.data?.attendance_rate ?? 0,
                      hint: formatNumber(attendanceSummaryQuery.data?.present ?? 0),
                    },
                    {
                      label: 'Ausentes e atrasos',
                      value: 100 - (attendanceSummaryQuery.data?.attendance_rate ?? 0),
                      hint: formatNumber(attendanceSummaryQuery.data?.absent ?? 0),
                    },
                  ]}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <QuickActions />
            </div>
            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function MetricSkeletonCards() {
  return Array.from({ length: 6 }).map((_, index) => (
    <Card key={index} className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  ));
}

function MetricsError() {
  return (
    <Card className="sm:col-span-2 lg:col-span-4">
      <CardContent className="py-6 text-sm text-destructive">
        Não foi possível carregar os indicadores da visão geral.
      </CardContent>
    </Card>
  );
}

function ChartError({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-base font-semibold">{title}</p>
      </CardHeader>
      <CardContent className="text-sm text-destructive">
        Não foi possível carregar esta seção.
      </CardContent>
    </Card>
  );
}
