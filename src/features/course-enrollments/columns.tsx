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
  COURSE_ENROLLMENT_STATUS_LABELS,
  toNumber,
  type CourseEnrollment,
  type CourseEnrollmentStatus,
} from './types';

const STATUS_STYLE: Record<CourseEnrollmentStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  completed: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  dropped: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  suspended: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
};

export function CourseEnrollmentStatusBadge({ status }: { status: CourseEnrollmentStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {COURSE_ENROLLMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (row: CourseEnrollment) => void;
  onEdit: (row: CourseEnrollment) => void;
  onDelete: (row: CourseEnrollment) => void;
  studentNames: Map<string, string>;
}

export function resolveStudentName(row: CourseEnrollment, studentNames: Map<string, string>) {
  return row.student?.name ?? (row.student_id ? studentNames.get(row.student_id) : undefined) ?? row.user?.name ?? row.student_id ?? row.user_id ?? '—';
}

export function buildCourseEnrollmentColumns({
  onView,
  onEdit,
  onDelete,
  studentNames,
}: ColumnActions): Column<CourseEnrollment>[] {
  return [
    {
      id: 'student',
      header: 'Aluno',
      cell: (e) => <span className="font-medium">{resolveStudentName(e, studentNames)}</span>,
      sortValue: (e) => resolveStudentName(e, studentNames),
      exportValue: (e) => resolveStudentName(e, studentNames),
    },
    {
      id: 'course_id',
      header: 'Curso',
      cell: (e) => <span className="font-mono text-xs">{e.course_id}</span>,
      sortValue: (e) => e.course_id,
      exportValue: (e) => e.course_id,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (e) => <CourseEnrollmentStatusBadge status={e.status} />,
      sortValue: (e) => COURSE_ENROLLMENT_STATUS_LABELS[e.status],
      exportValue: (e) => COURSE_ENROLLMENT_STATUS_LABELS[e.status],
    },
    {
      id: 'progress_percent',
      header: 'Progresso',
      cell: (e) => {
        const progress = toNumber(e.progress_percent);
        return progress == null ? '—' : formatPercent(progress, 0);
      },
      sortValue: (e) => toNumber(e.progress_percent),
      exportValue: (e) => toNumber(e.progress_percent),
    },
    {
      id: 'final_grade',
      header: 'Nota final',
      cell: (e) => e.final_grade ?? '—',
      sortValue: (e) => toNumber(e.final_grade),
      exportValue: (e) => e.final_grade,
      defaultHidden: true,
    },
    {
      id: 'enrolled_at',
      header: 'Matrícula',
      cell: (e) => formatDateTime(e.enrolled_at),
      sortValue: (e) => e.enrolled_at,
      exportValue: (e) => formatDateTime(e.enrolled_at),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (e) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(e)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(e)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(e)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
