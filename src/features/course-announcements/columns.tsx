'use client';

import { Eye, MoreHorizontal, Pencil, Pin, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDateTime } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import type { CourseAnnouncement } from './types';

interface ColumnActions {
  onView: (announcement: CourseAnnouncement) => void;
  onEdit: (announcement: CourseAnnouncement) => void;
  onDelete: (announcement: CourseAnnouncement) => void;
}

export function buildCourseAnnouncementColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<CourseAnnouncement>[] {
  return [
    {
      id: 'title',
      header: 'Aviso',
      cell: (a) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-medium">
            {a.is_pinned && <Pin className="size-3.5 text-primary" />}
            {a.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">{a.course?.title ?? a.course_id}</p>
        </div>
      ),
      sortValue: (a) => a.title,
      exportValue: (a) => a.title,
    },
    {
      id: 'course',
      header: 'Curso',
      cell: (a) => a.course?.title ?? a.course_id,
      sortValue: (a) => a.course?.title ?? a.course_id,
      exportValue: (a) => a.course?.title ?? a.course_id,
      defaultHidden: true,
    },
    {
      id: 'published_at',
      header: 'Publicação',
      cell: (a) => formatDateTime(a.published_at),
      sortValue: (a) => a.published_at,
      exportValue: (a) => formatDateTime(a.published_at),
    },
    {
      id: 'pinned',
      header: 'Fixado',
      cell: (a) => <Badge variant={a.is_pinned ? 'default' : 'secondary'}>{a.is_pinned ? 'Sim' : 'Não'}</Badge>,
      sortValue: (a) => Number(a.is_pinned),
      exportValue: (a) => (a.is_pinned ? 'Sim' : 'Não'),
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
