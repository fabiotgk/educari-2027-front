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
import type { SchoolCalendar } from './types';

export function CalendarPublishedBadge({ published }: { published: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        published
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-700',
      )}
    >
      {published ? 'Publicado' : 'Rascunho'}
    </Badge>
  );
}

interface ColumnActions {
  onView: (c: SchoolCalendar) => void;
  onEdit: (c: SchoolCalendar) => void;
  onDelete: (c: SchoolCalendar) => void;
}

export function buildSchoolCalendarColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<SchoolCalendar>[] {
  return [
    {
      id: 'academic_year',
      header: 'Ano letivo',
      cell: (c) => <span className="font-mono font-semibold">{c.academic_year}</span>,
      sortValue: (c) => c.academic_year,
      exportValue: (c) => c.academic_year,
    },
    {
      id: 'name',
      header: 'Calendário',
      cell: (c) => <span className="font-medium">{c.name}</span>,
      sortValue: (c) => c.name,
      exportValue: (c) => c.name,
    },
    {
      id: 'period',
      header: 'Período',
      cell: (c) => (
        <span className="text-sm tabular-nums">
          {c.starts_at ? formatDate(c.starts_at) : '—'}
          {c.starts_at && c.ends_at ? ' – ' : ''}
          {c.ends_at ? formatDate(c.ends_at) : ''}
        </span>
      ),
      exportValue: (c) =>
        c.starts_at && c.ends_at ? `${formatDate(c.starts_at)} – ${formatDate(c.ends_at)}` : '',
    },
    {
      id: 'days_planned',
      header: 'Dias planejados',
      cell: (c) => (
        <span className="tabular-nums">{c.total_school_days_planned ?? '—'}</span>
      ),
      sortValue: (c) => c.total_school_days_planned,
      exportValue: (c) => c.total_school_days_planned,
    },
    {
      id: 'days_actual',
      header: 'Dias realizados',
      cell: (c) => (
        <span className="tabular-nums">{c.total_school_days_actual ?? '—'}</span>
      ),
      exportValue: (c) => c.total_school_days_actual,
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (c) => <CalendarPublishedBadge published={c.is_published} />,
      sortValue: (c) => (c.is_published ? 'Publicado' : 'Rascunho'),
      exportValue: (c) => (c.is_published ? 'Publicado' : 'Rascunho'),
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
