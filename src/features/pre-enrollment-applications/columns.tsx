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
  PRE_ENROLLMENT_STATUS_LABELS,
  type PreEnrollmentApplication,
  type PreEnrollmentStatus,
} from './types';

const STATUS_STYLE: Record<PreEnrollmentStatus, string> = {
  submitted: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  under_review: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  placed: 'border-emerald-700/30 bg-emerald-700/10 text-emerald-800',
  waitlisted: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  expired: 'border-slate-500/30 bg-slate-500/10 text-slate-600',
};

export function PreEnrollmentStatusBadge({ status }: { status: PreEnrollmentStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {PRE_ENROLLMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (a: PreEnrollmentApplication) => void;
  onEdit: (a: PreEnrollmentApplication) => void;
  onDelete: (a: PreEnrollmentApplication) => void;
}

export function buildPreEnrollmentColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<PreEnrollmentApplication>[] {
  return [
    {
      id: 'protocol_number',
      header: 'Protocolo',
      cell: (a) => <span className="font-mono text-xs">{a.protocol_number}</span>,
      sortValue: (a) => a.protocol_number,
      exportValue: (a) => a.protocol_number,
    },
    {
      id: 'student_name',
      header: 'Aluno',
      cell: (a) => (
        <span className="font-medium">
          {String(a.student_data?.name ?? '—')}
        </span>
      ),
      sortValue: (a) => String(a.student_data?.name ?? ''),
      exportValue: (a) => String(a.student_data?.name ?? ''),
    },
    {
      id: 'guardian_name',
      header: 'Responsável',
      cell: (a) => <span>{String(a.guardian_data?.name ?? '—')}</span>,
      sortValue: (a) => String(a.guardian_data?.name ?? ''),
      exportValue: (a) => String(a.guardian_data?.name ?? ''),
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (a) => <PreEnrollmentStatusBadge status={a.status} />,
      sortValue: (a) => PRE_ENROLLMENT_STATUS_LABELS[a.status],
      exportValue: (a) => PRE_ENROLLMENT_STATUS_LABELS[a.status],
    },
    {
      id: 'created_at',
      header: 'Inscrito em',
      cell: (a) => <span className="tabular-nums text-sm">{formatDate(a.created_at)}</span>,
      sortValue: (a) => a.created_at,
      exportValue: (a) => formatDate(a.created_at),
    },
    {
      id: 'placed_at',
      header: 'Matriculado em',
      cell: (a) => (
        <span className="tabular-nums text-sm">
          {a.placed_at ? formatDate(a.placed_at) : '—'}
        </span>
      ),
      exportValue: (a) => (a.placed_at ? formatDate(a.placed_at) : ''),
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (a) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(a)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(a)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(a)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
