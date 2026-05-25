import { Topbar } from '@/components/dashboard/topbar';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { MOCK_METRICS } from '@/data/mock';
import { formatNumber, formatPercent } from '@/lib/format';

/** Dashboard da REDE — Secretário Municipal / Administrador. */
export default function SecretaryDashboard() {
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Visão geral da rede' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
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
            <div className="space-y-6 lg:col-span-2">
              <QuickActions />
              <div className="rounded-lg border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Tendências da rede</p>
                <p>Matrícula, frequência e desempenho por escola — gráficos conectam quando a API dos módulos responder.</p>
              </div>
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
