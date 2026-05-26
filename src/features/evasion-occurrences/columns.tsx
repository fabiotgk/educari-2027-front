'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/crud/data-table';
import {
  EVASION_OCCURRENCE_ASSIGNED_TO_LABELS,
  EVASION_OCCURRENCE_KIND_LABELS,
  EVASION_OCCURRENCE_STATUS_LABELS,
  type EvasionOccurrence,
  type EvasionOccurrenceAssignedTo,
  type EvasionOccurrenceKind,
  type EvasionOccurrenceStatus,
} from './types';

const STATUS_STYLE: Record<EvasionOccurrenceStatus, string> = {
  open: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  escalated: 'border-purple-500/30 bg-purple-500/10 text-purple-700',
  resolved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  closed: 'border-muted-foreground/30 bg-muted text-muted-foreground',
};

const KIND_STYLE: Record<EvasionOccurrenceKind, string> = {
  low_attendance: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  consecutive_absences: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  dropout_risk: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

const ASSIGNED_STYLE: Record<EvasionOccurrenceAssignedTo, string> = {
  school: 'border-green-500/30 bg-green-500/10 text-green-700',
  sme: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700',
  conselho_tutelar: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  ministerio_publico: 'border-orange-500/30 bg-orange-500/10 text-orange-700',
};

const toPercent = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') return '—';
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? `${formatNumber(parsed, 2)}%` : '—';
};

export function EvasionOccurrenceStatusBadge({ status }: { status: EvasionOccurrenceStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {EVASION_OCCURRENCE_STATUS_LABELS[status]}
    </Badge>
  );
}

export function EvasionOccurrenceKindBadge({ kind }: { kind: EvasionOccurrenceKind }) {
  return (
    <Badge variant="outline" className={cn(KIND_STYLE[kind])}>
      {EVASION_OCCURRENCE_KIND_LABELS[kind]}
    </Badge>
  );
}

export function EvasionOccurrenceAssignedToBadge({ assignedTo }: { assignedTo: EvasionOccurrenceAssignedTo }) {
  return (
    <Badge variant="outline" className={cn(ASSIGNED_STYLE[assignedTo])}>
      {EVASION_OCCURRENCE_ASSIGNED_TO_LABELS[assignedTo]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (row: EvasionOccurrence) => void;
  onEdit: (row: EvasionOccurrence) => void;
  onDelete: (row: EvasionOccurrence) => void;
}

export function buildEvasionOccurrenceColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<EvasionOccurrence>[] {
  return [
    {
      id: 'kind',
      header: 'Tipo',
      cell: (row) => <EvasionOccurrenceKindBadge kind={row.kind} />,
      sortValue: (row) => EVASION_OCCURRENCE_KIND_LABELS[row.kind],
      exportValue: (row) => EVASION_OCCURRENCE_KIND_LABELS[row.kind],
    },
    {
      id: 'enrollment_id',
      header: 'Matrícula',
      cell: (row) => <span className="font-mono text-xs">{row.enrollment_id}</span>,
      sortValue: (row) => row.enrollment_id,
      exportValue: (row) => row.enrollment_id,
    },
    {
      id: 'student_id',
      header: 'Aluno',
      cell: (row) => <span className="font-mono text-xs">{row.student_id}</span>,
      sortValue: (row) => row.student_id,
      exportValue: (row) => row.student_id,
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <EvasionOccurrenceStatusBadge status={row.status} />,
      sortValue: (row) => EVASION_OCCURRENCE_STATUS_LABELS[row.status],
      exportValue: (row) => EVASION_OCCURRENCE_STATUS_LABELS[row.status],
      className: 'w-36',
    },
    {
      id: 'assigned_to',
      header: 'Responsável',
      cell: (row) => <EvasionOccurrenceAssignedToBadge assignedTo={row.assigned_to} />,
      sortValue: (row) => EVASION_OCCURRENCE_ASSIGNED_TO_LABELS[row.assigned_to],
      exportValue: (row) => EVASION_OCCURRENCE_ASSIGNED_TO_LABELS[row.assigned_to],
      className: 'w-40',
    },
    {
      id: 'attendance_pct_at_detection',
      header: 'Frequência na detecção',
      cell: (row) => toPercent(row.attendance_pct_at_detection),
      sortValue: (row) => row.attendance_pct_at_detection,
      exportValue: (row) =>
        row.attendance_pct_at_detection == null
          ? ''
          : String(row.attendance_pct_at_detection),
      className: 'w-32',
    },
    {
      id: 'consecutive_absences_at_detection',
      header: 'Faltas consecutivas',
      cell: (row) => (row.consecutive_absences_at_detection ?? '—'),
      sortValue: (row) => row.consecutive_absences_at_detection,
      exportValue: (row) => row.consecutive_absences_at_detection,
      defaultHidden: true,
    },
    {
      id: 'detected_at',
      header: 'Detectada em',
      cell: (row) => formatDate(row.detected_at),
      sortValue: (row) => row.detected_at,
      exportValue: (row) => formatDate(row.detected_at),
    },
    {
      id: 'updated_at',
      header: 'Atualizada em',
      cell: (row) => formatDate(row.updated_at),
      sortValue: (row) => row.updated_at,
      exportValue: (row) => formatDate(row.updated_at),
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (row) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(row)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(row)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
