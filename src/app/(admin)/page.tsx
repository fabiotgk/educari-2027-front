import { Topbar } from '@/components/dashboard/topbar';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { MOCK_METRICS } from '@/data/mock';
import { formatNumber, formatPercent } from '@/lib/format';

export default function DashboardPage() {
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Visão Geral' }]} />

      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto p-6 lg:p-8 space-y-6 max-w-7xl">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Indicadores consolidados da rede municipal · Ano letivo 2026
              </p>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Alunos matriculados"
              value={formatNumber(MOCK_METRICS.students)}
              delta={{ value: 2.1, positive: true }}
              icon="Users"
              accent="primary"
              index={0}
            />
            <MetricCard
              label="Pré-matrículas pendentes"
              value={formatNumber(MOCK_METRICS.pending_pre_enrollments)}
              icon="ClipboardList"
              accent="warning"
              index={1}
            />
            <MetricCard
              label="Frequência média"
              value={formatPercent(MOCK_METRICS.average_attendance_pct)}
              delta={{ value: 0.8, positive: true }}
              icon="CalendarCheck"
              accent="success"
              index={2}
            />
            <MetricCard
              label="Unidades escolares"
              value={MOCK_METRICS.schools_count}
              icon="Building2"
              accent="primary"
              index={3}
            />
          </div>

          {/* Conteúdo principal: ações rápidas + atividade */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <QuickActions />

              {/* Espaço para gráficos futuros */}
              <div className="rounded-lg border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">
                  Gráficos de tendências
                </p>
                <p>
                  Esta área receberá charts de matrícula, frequência e desempenho
                  por escola quando os dados reais estiverem conectados via API.
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <ActivityFeed />
            </div>
          </div>

          {/* Informação institucional discreta */}
          <footer className="text-center text-xs text-muted-foreground pt-6 border-t">
            <p>
              Educari · plataforma SaaS multi-tenant · {' '}
              <a
                href="https://github.com/fabiotgk/educari-2027-infra"
                className="underline hover:text-foreground"
              >
                educari-2027-infra
              </a>
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
