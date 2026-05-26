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
  TRAINING_COURSE_STATUS_LABELS,
  type TrainingCourse,
  type TrainingCourseStatus,
} from './types';

const STATUS_STYLE: Record<TrainingCourseStatus, string> = {
  planned: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  open: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  completed: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function TrainingCourseStatusBadge({ status }: { status: TrainingCourseStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {TRAINING_COURSE_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (c: TrainingCourse) => void;
  onEdit: (c: TrainingCourse) => void;
  onDelete: (c: TrainingCourse) => void;
}

export function buildTrainingCourseColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<TrainingCourse>[] {
  return [
    {
      id: 'academic_year',
      header: 'Ano letivo',
      cell: (c) => <span className="font-mono text-xs">{c.academic_year}</span>,
      sortValue: (c) => c.academic_year,
      exportValue: (c) => c.academic_year,
    },
    {
      id: 'title',
      header: 'Título do curso',
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{c.title}</p>
        </div>
      ),
      sortValue: (c) => c.title,
      exportValue: (c) => c.title,
    },
    {
      id: 'workload_hours',
      header: 'Carga horária',
      cell: (c) => (
        <span className="tabular-nums">{c.workload_hours != null ? `${c.workload_hours}h` : '—'}</span>
      ),
      sortValue: (c) => Number(c.workload_hours),
      exportValue: (c) => String(c.workload_hours),
    },
    {
      id: 'starts_on',
      header: 'Início',
      cell: (c) => formatDate(c.starts_on),
      sortValue: (c) => c.starts_on,
      exportValue: (c) => formatDate(c.starts_on),
      defaultHidden: true,
    },
    {
      id: 'ends_on',
      header: 'Término',
      cell: (c) => formatDate(c.ends_on),
      sortValue: (c) => c.ends_on,
      exportValue: (c) => formatDate(c.ends_on),
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (c) => <TrainingCourseStatusBadge status={c.status} />,
      sortValue: (c) => TRAINING_COURSE_STATUS_LABELS[c.status],
      exportValue: (c) => TRAINING_COURSE_STATUS_LABELS[c.status],
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (c) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(c)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(c)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(c)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
