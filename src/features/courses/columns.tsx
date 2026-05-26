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
import type { Column } from '@/components/crud/data-table';
import {
  COURSE_LEVEL_LABELS,
  COURSE_STATUS_LABELS,
  type Course,
  type CourseLevel,
  type CourseStatus,
} from './types';

const STATUS_STYLE: Record<CourseStatus, string> = {
  draft: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
  published: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  archived: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
};

const LEVEL_STYLE: Record<CourseLevel, string> = {
  basico: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  intermediario: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  avancado: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function CourseStatusBadge({ status }: { status: CourseStatus | null }) {
  if (!status) return <Badge variant="outline">Sem status</Badge>;
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {COURSE_STATUS_LABELS[status]}
    </Badge>
  );
}

export function CourseLevelBadge({ level }: { level: CourseLevel | null }) {
  if (!level) return <Badge variant="secondary">Sem nível</Badge>;
  return (
    <Badge variant="outline" className={cn(LEVEL_STYLE[level])}>
      {COURSE_LEVEL_LABELS[level]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export function buildCourseColumns({ onView, onEdit, onDelete }: ColumnActions): Column<Course>[] {
  return [
    {
      id: 'title',
      header: 'Curso',
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{c.title}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{c.slug}</p>
        </div>
      ),
      sortValue: (c) => c.title,
      exportValue: (c) => c.title,
    },
    {
      id: 'category',
      header: 'Categoria',
      cell: (c) => c.category ?? '—',
      sortValue: (c) => c.category,
      exportValue: (c) => c.category,
    },
    {
      id: 'level',
      header: 'Nível',
      cell: (c) => <CourseLevelBadge level={c.level} />,
      sortValue: (c) => (c.level ? COURSE_LEVEL_LABELS[c.level] : ''),
      exportValue: (c) => (c.level ? COURSE_LEVEL_LABELS[c.level] : ''),
    },
    {
      id: 'workload_hours',
      header: 'Carga horária',
      cell: (c) => (c.workload_hours != null ? `${c.workload_hours} h` : '—'),
      sortValue: (c) => c.workload_hours,
      exportValue: (c) => c.workload_hours,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (c) => <CourseStatusBadge status={c.status} />,
      sortValue: (c) => (c.status ? COURSE_STATUS_LABELS[c.status] : ''),
      exportValue: (c) => (c.status ? COURSE_STATUS_LABELS[c.status] : ''),
    },
    {
      id: 'instructor',
      header: 'Instrutor',
      cell: (c) => c.instructor?.name ?? c.instructor_id ?? '—',
      sortValue: (c) => c.instructor?.name ?? c.instructor_id,
      exportValue: (c) => c.instructor?.name ?? c.instructor_id,
      defaultHidden: true,
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
