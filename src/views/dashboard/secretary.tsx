import { Topbar } from '@/components/dashboard/topbar';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { BarChart, ProgressList } from '@/components/dashboard/charts';
import { MOCK_METRICS } from '@/data/mock';
import { formatNumber, formatPercent } from '@/lib/format';

const ENROLLMENTS_BY_MONTH = [
  { label: 'Jan', value: 6120 },
  { label: 'Fev', value: 7010 },
  { label: 'Mar', value: 7280 },
  { label: 'Abr', value: 7320 },
  { label: 'Mai', value: 7482 },
];

const ATTENDANCE_BY_SCHOOL = [
  { label: 'E. M. João da Cruz', value: 94 },
  { label: 'E. M. Pe. Augusto', value: 91 },
  { label: 'E. M. São José', value: 88 },
  { label: 'E. M. Santa Rita', value: 79 },
];

export default function SecretaryDashboard() {
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
            <MetricCard label="Alunos matriculados" value={formatNumber(MOCK_METRICS.students)} delta={{ value: 2.1, positive: true }} icon="Users" accent="primary" index={0} />
            <MetricCard label="Pré-matrículas pendentes" value={formatNumber(MOCK_METRICS.pending_pre_enrollments)} icon="ClipboardList" accent="warning" index={1} />
            <MetricCard label="Frequência média" value={formatPercent(MOCK_METRICS.average_attendance_pct)} delta={{ value: 0.8, positive: true }} icon="CalendarCheck" accent="success" index={2} />
            <MetricCard label="Unidades escolares" value={MOCK_METRICS.schools_count} icon="Building2" accent="primary" index={3} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BarChart
                title="Matrículas por mês"
                subtitle="Evolução de matrículas ativas na rede — 2026"
                data={ENROLLMENTS_BY_MONTH}
              />
            </div>
            <div className="lg:col-span-1">
              <ProgressList title="Frequência por escola" items={ATTENDANCE_BY_SCHOOL} />
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
