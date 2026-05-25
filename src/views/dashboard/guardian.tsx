import { Topbar } from '@/components/dashboard/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, FileText, Megaphone, CalendarCheck } from 'lucide-react';

const COMUNICADOS = [
  { titulo: 'Reunião de pais e mestres', data: '28/05', urgente: true },
  { titulo: 'Entrega de boletins do 1º bimestre', data: '24/05', urgente: false },
  { titulo: 'Festa junina — autorização', data: '20/05', urgente: false },
];

/** Dashboard da FAMÍLIA — Responsável / Aluno. */
export default function GuardianDashboard() {
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Acompanhamento' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="container mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
          <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
              PO
            </div>
            <div>
              <p className="text-sm font-semibold">Pedro Oliveira</p>
              <p className="text-xs text-muted-foreground">5º A · E. M. João da Cruz · Matrícula 2026-0487</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CalendarCheck className="h-8 w-8 text-emerald-500" />
                <div>
                  <p className="text-xl font-semibold">96,2%</p>
                  <p className="text-xs text-muted-foreground">Frequência</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-xl font-semibold">8,4</p>
                  <p className="text-xs text-muted-foreground">Média geral</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CalendarDays className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-xl font-semibold">28/05</p>
                  <p className="text-xs text-muted-foreground">Próximo evento</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4 text-primary" /> Comunicados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {COMUNICADOS.map((c) => (
                <div key={c.titulo} className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <p className="text-sm">{c.titulo}</p>
                  <div className="flex items-center gap-2">
                    {c.urgente && <Badge className="bg-amber-500 text-[10px] hover:bg-amber-500">importante</Badge>}
                    <span className="text-xs text-muted-foreground">{c.data}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
