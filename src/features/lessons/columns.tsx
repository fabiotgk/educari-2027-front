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
import { LESSON_CONTENT_TYPE_LABELS, type Lesson } from './types';

interface ColumnActions {
  onView: (lesson: Lesson) => void;
  onEdit: (lesson: Lesson) => void;
  onDelete: (lesson: Lesson) => void;
}

export function buildLessonColumns({ onView, onEdit, onDelete }: ColumnActions): Column<Lesson>[] {
  return [
    {
      id: 'position',
      header: 'Ordem',
      cell: (l) => <span className="font-mono text-xs">{l.position ?? '—'}</span>,
      sortValue: (l) => l.position,
      exportValue: (l) => l.position,
    },
    {
      id: 'title',
      header: 'Aula',
      cell: (l) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{l.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {l.course_module?.title ?? l.course_module_id}
          </p>
        </div>
      ),
      sortValue: (l) => l.title,
      exportValue: (l) => l.title,
    },
    {
      id: 'content_type',
      header: 'Tipo',
      cell: (l) => <Badge variant="secondary">{l.content_type ? LESSON_CONTENT_TYPE_LABELS[l.content_type] : '—'}</Badge>,
      sortValue: (l) => (l.content_type ? LESSON_CONTENT_TYPE_LABELS[l.content_type] : ''),
      exportValue: (l) => (l.content_type ? LESSON_CONTENT_TYPE_LABELS[l.content_type] : ''),
    },
    {
      id: 'duration_minutes',
      header: 'Duração',
      cell: (l) => (l.duration_minutes != null ? `${l.duration_minutes} min` : '—'),
      sortValue: (l) => l.duration_minutes,
      exportValue: (l) => l.duration_minutes,
    },
    {
      id: 'status',
      header: 'Publicação',
      cell: (l) => <Badge variant={l.is_published ? 'default' : 'secondary'}>{l.is_published ? 'Publicada' : 'Rascunho'}</Badge>,
      sortValue: (l) => Number(l.is_published),
      exportValue: (l) => (l.is_published ? 'Publicada' : 'Rascunho'),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (l) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(l)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(l)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(l)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
