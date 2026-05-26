'use client';

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
import { cn } from '@/lib/utils';
import { LOAN_BORROWER_TYPE_LABELS, LOAN_STATUS_LABELS, type LoanStatus } from './types';
import { useLibraryItemLoans } from './hooks';

const LOAN_STATUS_STYLE: Record<LoanStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  returned: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  overdue: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  lost: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-700',
};

/** Aba de relacionamento: empréstimos vinculados a este item de biblioteca. */
export function LibraryItemLoansTab({ libraryItemId }: { libraryItemId: string }) {
  const query = useLibraryItemLoans(libraryItemId);

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os empréstimos deste item.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum empréstimo registrado para este item.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Tipo de tomador</TableHead>
            <TableHead>Empréstimo</TableHead>
            <TableHead>Devolução prevista</TableHead>
            <TableHead>Devolvido em</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((loan) => (
            <TableRow key={loan.id}>
              <TableCell>
                <Badge variant="secondary">
                  {LOAN_BORROWER_TYPE_LABELS[loan.borrower_type]}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums text-sm">
                {formatDate(loan.loaned_at)}
              </TableCell>
              <TableCell className="tabular-nums text-sm">
                {formatDate(loan.due_at)}
              </TableCell>
              <TableCell className="tabular-nums text-sm">
                {loan.returned_at ? formatDate(loan.returned_at) : '—'}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(LOAN_STATUS_STYLE[loan.status])}
                >
                  {LOAN_STATUS_LABELS[loan.status]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
