'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarCheck } from 'lucide-react';

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
import { usePortalAttendance } from '@/features/portal/hooks';
import { formatDate } from '@/lib/format';

const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  present: 'Presente',
  absent: 'Ausente',
  justified: 'Justificada',
  late: 'Atraso',
};

interface PortalAttendancePageProps {
  studentId: string;
}

export function PortalAttendancePage({ studentId }: PortalAttendancePageProps) {
  const { data: records = [], isLoading, isError } = usePortalAttendance(studentId);

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
            <CalendarCheck className="text-primary h-5 w-5" />
            Frequência
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Registros de presença e ausência lançados pela escola.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Carregando frequência...</p>
          ) : isError ? (
            <p className="text-destructive text-sm">Não foi possível carregar a frequência.</p>
          ) : records.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum registro de frequência até o momento.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Aula</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.lesson_date)}</TableCell>
                    <TableCell>{record.lesson_number_in_day ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'absent' ? 'destructive' : 'outline'}>
                        {ATTENDANCE_STATUS_LABELS[record.status] ?? record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.notes ?? '—'}</TableCell>
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
