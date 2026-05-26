'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  FINANCIAL_PROGRAM_STATUS_LABELS,
  type FinancialProgram,
  type FinancialProgramStatus,
} from './types';

const STATUS_STYLE: Record<FinancialProgramStatus, string> = {
  open: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  closed: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function FinancialProgramStatusBadge({
  status,
}: {
  status: FinancialProgramStatus | null;
}) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {FINANCIAL_PROGRAM_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (p: FinancialProgram) => void;
  onEdit: (p: FinancialProgram) => void;
  onDelete: (p: FinancialProgram) => void;
}

export function buildFinancialProgramColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<FinancialProgram>[] {
  return [
    {
      id: 'name',
      header: 'Programa',
      cell: (p) => <span className="font-medium">{p.name}</span>,
      sortValue: (p) => p.name,
      exportValue: (p) => p.name,
    },
    {
      id: 'exercise_year',
      header: 'Exercício',
      cell: (p) => <span className="font-mono text-xs">{p.exercise_year}</span>,
      sortValue: (p) => p.exercise_year,
      exportValue: (p) => p.exercise_year,
    },
    {
      id: 'funding_source',
      header: 'Fonte de recurso',
      cell: (p) => <span>{p.funding_source ?? '—'}</span>,
      sortValue: (p) => p.funding_source,
      exportValue: (p) => p.funding_source ?? '',
    },
    {
      id: 'agreement',
      header: 'Convênio',
      cell: (p) => <span className="text-xs">{p.agreement ?? '—'}</span>,
      exportValue: (p) => p.agreement ?? '',
      defaultHidden: true,
    },
    {
      id: 'process_number',
      header: 'N.º Processo',
      cell: (p) => <span className="font-mono text-xs">{p.process_number ?? '—'}</span>,
      exportValue: (p) => p.process_number ?? '',
      defaultHidden: true,
    },
    {
      id: 'opened_at',
      header: 'Aberto em',
      cell: (p) => <span className="text-xs">{formatDate(p.opened_at)}</span>,
      sortValue: (p) => p.opened_at,
      exportValue: (p) => formatDate(p.opened_at),
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (p) => <FinancialProgramStatusBadge status={p.status} />,
      sortValue: (p) => (p.status ? FINANCIAL_PROGRAM_STATUS_LABELS[p.status] : ''),
      exportValue: (p) =>
        p.status ? FINANCIAL_PROGRAM_STATUS_LABELS[p.status] : '',
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (p) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(p)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(p)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(p)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
