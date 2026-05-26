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
import { formatDate } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import type { TeachingRecord } from './types';

interface ColumnActions {
  onView: (record: TeachingRecord) => void;
  onEdit: (record: TeachingRecord) => void;
  onDelete: (record: TeachingRecord) => void;
}

export function buildTeachingRecordColumns({ onView, onEdit, onDelete }: ColumnActions): Column<TeachingRecord>[] {
  return [
    {
      id: 'lesson_date',
      header: 'Data',
      cell: (record) => formatDate(record.lesson_date),
      sortValue: (record) => record.lesson_date,
      exportValue: (record) => formatDate(record.lesson_date),
    },
    {
      id: 'lesson_number',
      header: 'Aula',
      cell: (record) => record.lesson_number_in_day,
      sortValue: (record) => record.lesson_number_in_day,
      exportValue: (record) => record.lesson_number_in_day,
    },
    {
      id: 'class_diary',
      header: 'Diário',
      cell: (record) => record.class_diary_id,
      sortValue: (record) => record.class_diary_id,
      exportValue: (record) => record.class_diary_id,
      defaultHidden: true,
    },
    {
      id: 'substitution',
      header: 'Substituição',
      cell: (record) => (record.is_substituted ? <Badge variant="secondary">Sim</Badge> : 'Não'),
      sortValue: (record) => (record.is_substituted ? 1 : 0),
      exportValue: (record) => (record.is_substituted ? 'Sim' : 'Não'),
    },
    {
      id: 'updated_at',
      header: 'Atualizado em',
      cell: (record) => formatDate(record.updated_at),
      sortValue: (record) => record.updated_at,
      exportValue: (record) => formatDate(record.updated_at),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (record) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(record)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(record)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(record)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
