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
import { formatCurrency } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  STATE_MEAL_PROGRAM_STATUS_LABELS,
  type StateMealProgram,
  type StateMealProgramStatus,
} from './types';

const STATUS_STYLE: Record<StateMealProgramStatus, string> = {
  draft: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  closed: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function StateMealProgramStatusBadge({ status }: { status: StateMealProgramStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {STATE_MEAL_PROGRAM_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (s: StateMealProgram) => void;
  onEdit: (s: StateMealProgram) => void;
  onDelete: (s: StateMealProgram) => void;
}

export function buildStateMealProgramColumns({ onView, onEdit, onDelete }: ColumnActions): Column<StateMealProgram>[] {
  return [
    {
      id: 'name',
      header: 'Programa',
      cell: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{s.name}</p>
          {s.agreement_number && <p className="truncate text-xs text-muted-foreground">{s.agreement_number}</p>}
        </div>
      ),
      sortValue: (s) => s.name,
      exportValue: (s) => s.name,
    },
    {
      id: 'fiscal_year',
      header: 'Ano fiscal',
      cell: (s) => <span className="tabular-nums">{s.fiscal_year}</span>,
      sortValue: (s) => String(s.fiscal_year),
      exportValue: (s) => String(s.fiscal_year),
    },
    {
      id: 'total_value',
      header: 'Valor total',
      cell: (s) => <span className="tabular-nums">{s.total_value != null ? formatCurrency(s.total_value) : '—'}</span>,
      sortValue: (s) => s.total_value ?? 0,
      exportValue: (s) => (s.total_value != null ? formatCurrency(s.total_value) : ''),
    },
    {
      id: 'funding_source',
      header: 'Fonte de financiamento',
      cell: (s) => <span className="truncate">{s.funding_source ?? '—'}</span>,
      sortValue: (s) => s.funding_source,
      exportValue: (s) => s.funding_source ?? '',
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (s) => <StateMealProgramStatusBadge status={s.status} />,
      sortValue: (s) => STATE_MEAL_PROGRAM_STATUS_LABELS[s.status],
      exportValue: (s) => STATE_MEAL_PROGRAM_STATUS_LABELS[s.status],
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (s) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(s)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(s)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(s)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
