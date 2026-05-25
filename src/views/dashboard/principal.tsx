import { Topbar } from '@/components/dashboard/topbar';
import { MetricCard } from '@/components/dashboard/metric-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';

/** Dashboard da ESCOLA — Diretor / Vice / Coordenação / Secretaria escolar. */
export default function PrincipalDashboard() {
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'E. M. João da Cruz' }, { label: 'Visão geral' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">E. M. João da Cruz</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Visão geral da unidade · Ano letivo 2026
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Alunos da unidade" value={487} delta={{ value: 1.2, positive: true }} icon="Users" accent="primary" index={0} />
            <MetricCard label="Turmas ativas" value={18} icon="LayoutGrid" accent="primary" index={1} />
            <MetricCard label="Frequência da escola" value="93,1%" delta={{ value: 0.5, positive: true }} icon="CalendarCheck" accent="success" index={2} />
            <MetricCard label="Professores" value={26} icon="GraduationCap" accent="primary" index={3} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <QuickActions />
              <div className="rounded-lg border border-dashed bg-card p-12 text-center text-sm text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Desempenho por turma</p>
                <p>Frequência, notas e ocorrências por turma da unidade.</p>
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
