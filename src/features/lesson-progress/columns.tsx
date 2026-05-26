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
import type { Column } from '@/components/crud/data-table';
import { formatDateTime, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  LESSON_PROGRESS_STATUS_LABELS,
  toNumber,
  type LessonProgress,
  type LessonProgressStatus,
} from './types';

const STATUS_STYLE: Record<LessonProgressStatus, string> = {
  not_started: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
  in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
};

export function LessonProgressStatusBadge({ status }: { status: LessonProgressStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {LESSON_PROGRESS_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (row: LessonProgress) => void;
  onEdit: (row: LessonProgress) => void;
  onDelete: (row: LessonProgress) => void;
}

export function buildLessonProgressColumns({ onView, onEdit, onDelete }: ColumnActions): Column<LessonProgress>[] {
  return [
    {
      id: 'lesson_id',
      header: 'Aula',
      cell: (p) => <span className="font-mono text-xs">{p.lesson_id}</span>,
      sortValue: (p) => p.lesson_id,
      exportValue: (p) => p.lesson_id,
    },
    {
      id: 'course_enrollment_id',
      header: 'Matrícula',
      cell: (p) => <span className="font-mono text-xs">{p.course_enrollment_id}</span>,
      sortValue: (p) => p.course_enrollment_id,
      exportValue: (p) => p.course_enrollment_id,
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (p) => <LessonProgressStatusBadge status={p.status} />,
      sortValue: (p) => LESSON_PROGRESS_STATUS_LABELS[p.status],
      exportValue: (p) => LESSON_PROGRESS_STATUS_LABELS[p.status],
    },
    {
      id: 'progress_percent',
      header: 'Progresso',
      cell: (p) => {
        const progress = toNumber(p.progress_percent);
        return progress == null ? '—' : formatPercent(progress, 0);
      },
      sortValue: (p) => toNumber(p.progress_percent),
      exportValue: (p) => toNumber(p.progress_percent),
    },
    {
      id: 'time_spent_seconds',
      header: 'Tempo',
      cell: (p) => `${toNumber(p.time_spent_seconds) ?? 0} s`,
      sortValue: (p) => toNumber(p.time_spent_seconds),
      exportValue: (p) => toNumber(p.time_spent_seconds),
    },
    {
      id: 'last_accessed_at',
      header: 'Último acesso',
      cell: (p) => formatDateTime(p.last_accessed_at),
      sortValue: (p) => p.last_accessed_at,
      exportValue: (p) => formatDateTime(p.last_accessed_at),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (p) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
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
