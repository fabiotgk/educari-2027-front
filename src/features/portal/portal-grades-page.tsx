'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePortalGrades } from '@/features/portal/hooks';
import { formatDate, formatNumber } from '@/lib/format';

interface PortalGradesPageProps {
  studentId: string;
}

export function PortalGradesPage({ studentId }: PortalGradesPageProps) {
  const { data: grades = [], isLoading, isError } = usePortalGrades(studentId);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/portal">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BookOpenCheck className="text-primary h-5 w-5" />
            Boletim
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Notas registradas por componente curricular e período.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Carregando boletim...</p>
          ) : isError ? (
            <p className="text-destructive text-sm">Não foi possível carregar o boletim.</p>
          ) : grades.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma nota registrada até o momento.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Componente</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Registrada em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>{grade.subject?.name ?? grade.subject_id}</TableCell>
                    <TableCell>
                      {grade.evaluation_period?.name ?? grade.evaluation_period_id}
                    </TableCell>
                    <TableCell>{grade.activity_label}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <span>{formatGradeValue(grade.score_numeric, grade.score_concept)}</span>
                        {grade.is_recovered && <Badge variant="outline">Recuperação</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(grade.recorded_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatGradeValue(
  scoreNumeric: number | string | null,
  scoreConcept: string | null
): string {
  if (scoreNumeric !== null) {
    const value = typeof scoreNumeric === 'string' ? Number(scoreNumeric) : scoreNumeric;
    return Number.isFinite(value) ? formatNumber(value, 1) : String(scoreNumeric);
  }
  return scoreConcept ?? '—';
}
