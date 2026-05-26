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
import type { CourseModule } from './types';

interface ColumnActions {
  onView: (module: CourseModule) => void;
  onEdit: (module: CourseModule) => void;
  onDelete: (module: CourseModule) => void;
}

export function PublishedBadge({ published }: { published: boolean }) {
  return <Badge variant={published ? 'default' : 'secondary'}>{published ? 'Publicado' : 'Rascunho'}</Badge>;
}

export function buildCourseModuleColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<CourseModule>[] {
  return [
    {
      id: 'position',
      header: 'Ordem',
      cell: (m) => <span className="font-mono text-xs">{m.position ?? '—'}</span>,
      sortValue: (m) => m.position,
      exportValue: (m) => m.position,
    },
    {
      id: 'title',
      header: 'Módulo',
      cell: (m) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{m.title}</p>
          <p className="truncate text-xs text-muted-foreground">{m.course?.title ?? m.course_id}</p>
        </div>
      ),
      sortValue: (m) => m.title,
      exportValue: (m) => m.title,
    },
    {
      id: 'course',
      header: 'Curso',
      cell: (m) => m.course?.title ?? m.course_id,
      sortValue: (m) => m.course?.title ?? m.course_id,
      exportValue: (m) => m.course?.title ?? m.course_id,
      defaultHidden: true,
    },
    {
      id: 'published',
      header: 'Publicação',
      cell: (m) => <PublishedBadge published={m.is_published} />,
      sortValue: (m) => Number(m.is_published),
      exportValue: (m) => (m.is_published ? 'Publicado' : 'Rascunho'),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (m) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(m)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(m)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(m)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
