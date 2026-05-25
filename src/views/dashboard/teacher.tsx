import { Topbar } from '@/components/dashboard/topbar';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ClipboardCheck, Clock } from 'lucide-react';

const TURMAS = [
  { turma: '5º A', componente: 'Matemática', alunos: 28, horario: '07:30' },
  { turma: '5º B', componente: 'Matemática', alunos: 30, horario: '09:30' },
  { turma: '6º A', componente: 'Matemática', alunos: 32, horario: '13:30' },
];

const PENDENCIAS = [
  { label: 'Frequência do 5º A — aula de hoje', tipo: 'Frequência' },
  { label: 'Lançar notas do 2º bimestre — 6º A', tipo: 'Notas' },
  { label: 'Plano de aula da semana — 5º B', tipo: 'Diário' },
];

/** Dashboard do PROFESSOR — minhas turmas e pendências. */
export default function TeacherDashboard() {
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Minhas turmas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Minhas turmas</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Diário, frequência e notas das suas turmas
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard label="Turmas" value={3} icon="LayoutGrid" accent="primary" index={0} />
            <MetricCard label="Aulas hoje" value={2} icon="Clock" accent="primary" index={1} />
            <MetricCard label="Pendências" value={PENDENCIAS.length} icon="ClipboardCheck" accent="warning" index={2} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" /> Turmas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {TURMAS.map((t) => (
                  <div key={t.turma} className="flex items-center justify-between rounded-lg border bg-card p-3">
                    <div>
                      <p className="text-sm font-semibold">{t.turma} · {t.componente}</p>
                      <p className="text-xs text-muted-foreground">{t.alunos} alunos</p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" /> {t.horario}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardCheck className="h-4 w-4 text-amber-500" /> Pendências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PENDENCIAS.map((p) => (
                  <div key={p.label} className="rounded-lg border bg-card p-3">
                    <Badge variant="outline" className="mb-1 text-[10px]">{p.tipo}</Badge>
                    <p className="text-sm">{p.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
