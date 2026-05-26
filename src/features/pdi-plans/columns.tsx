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
  PDI_PLAN_STATUS_LABELS,
  type PdiPlan,
  type PdiPlanStatus,
} from './types';

const STATUS_STYLE: Record<PdiPlanStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  inactive: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
  completed: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function PdiPlanStatusBadge({ status }: { status: PdiPlanStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {PDI_PLAN_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (p: PdiPlan) => void;
  onEdit: (p: PdiPlan) => void;
  onDelete: (p: PdiPlan) => void;
}

export function buildPdiPlanColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<PdiPlan>[] {
  return [
    {
      id: 'reference_year',
      header: 'Ano',
      cell: (p) => (
        <span className="font-mono text-xs font-semibold">{p.reference_year}</span>
      ),
      sortValue: (p) => p.reference_year,
      exportValue: (p) => p.reference_year,
    },
    {
      id: 'student_id',
      header: 'ID do aluno',
      cell: (p) => (
        <span className="font-mono text-xs">{p.student_id.slice(0, 8)}…</span>
      ),
      exportValue: (p) => p.student_id,
    },
    {
      id: 'school_id',
      header: 'ID da escola',
      cell: (p) => (
        <span className="font-mono text-xs">
          {p.school_id ? p.school_id.slice(0, 8) + '…' : '—'}
        </span>
      ),
      exportValue: (p) => p.school_id ?? '',
      defaultHidden: true,
    },
    {
      id: 'started_at',
      header: 'Início',
      cell: (p) => <span className="text-xs">{formatDate(p.started_at)}</span>,
      sortValue: (p) => p.started_at,
      exportValue: (p) => formatDate(p.started_at),
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (p) => <PdiPlanStatusBadge status={p.status} />,
      sortValue: (p) => PDI_PLAN_STATUS_LABELS[p.status],
      exportValue: (p) => PDI_PLAN_STATUS_LABELS[p.status],
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
