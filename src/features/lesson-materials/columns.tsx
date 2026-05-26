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
import type { LessonMaterial } from './types';

interface ColumnActions {
  onView: (material: LessonMaterial) => void;
  onEdit: (material: LessonMaterial) => void;
  onDelete: (material: LessonMaterial) => void;
}

export function buildLessonMaterialColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<LessonMaterial>[] {
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
      header: 'Material',
      cell: (m) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{m.title}</p>
          <p className="truncate text-xs text-muted-foreground">{m.lesson?.title ?? m.lesson_id}</p>
        </div>
      ),
      sortValue: (m) => m.title,
      exportValue: (m) => m.title,
    },
    {
      id: 'file_type',
      header: 'Tipo',
      cell: (m) => (m.file_type ? <Badge variant="secondary">{m.file_type}</Badge> : '—'),
      sortValue: (m) => m.file_type,
      exportValue: (m) => m.file_type,
    },
    {
      id: 'file_size_kb',
      header: 'Tamanho',
      cell: (m) => (m.file_size_kb != null ? `${m.file_size_kb} KB` : '—'),
      sortValue: (m) => m.file_size_kb,
      exportValue: (m) => m.file_size_kb,
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
