'use client';

import { useCalendarEvents } from './hooks';
import { CALENDAR_EVENT_KIND_LABELS } from './types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/format';

/** Aba de relacionamento: eventos do calendário letivo. */
export function CalendarEventsTab({ calendarId }: { calendarId: string }) {
  const query = useCalendarEvents(calendarId);

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os eventos deste calendário.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum evento cadastrado neste calendário.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Dia letivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="tabular-nums">{formatDate(e.event_date)}</TableCell>
              <TableCell className="font-medium">{e.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {CALENDAR_EVENT_KIND_LABELS[e.kind] ?? e.kind}
                </Badge>
              </TableCell>
              <TableCell>
                {e.counts_as_school_day ? (
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700">
                    Sim
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Não</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
