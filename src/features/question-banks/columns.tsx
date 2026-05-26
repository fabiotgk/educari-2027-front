'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

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
import type { QuestionBank } from './types';

interface ColumnActions {
  onView: (b: QuestionBank) => void;
  onEdit: (b: QuestionBank) => void;
  onDelete: (b: QuestionBank) => void;
}

export function buildQuestionBankColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<QuestionBank>[] {
  return [
    {
      id: 'name',
      header: 'Banco de questões',
      cell: (b) => <span className="font-medium">{b.name}</span>,
      sortValue: (b) => b.name,
      exportValue: (b) => b.name,
    },
    {
      id: 'subject_id',
      header: 'Disciplina (ID)',
      cell: (b) => (
        <span className="font-mono text-xs text-muted-foreground">
          {b.subject_id ?? '—'}
        </span>
      ),
      exportValue: (b) => b.subject_id ?? '',
      defaultHidden: true,
    },
    {
      id: 'description',
      header: 'Descrição',
      cell: (b) => (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {b.description ?? '—'}
        </span>
      ),
      exportValue: (b) => b.description ?? '',
    },
    {
      id: 'created_at',
      header: 'Criado em',
      cell: (b) => (
        <span className="text-xs text-muted-foreground">{formatDateTime(b.created_at)}</span>
      ),
      sortValue: (b) => b.created_at,
      exportValue: (b) => b.created_at ?? '',
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (b) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(b)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(b)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(b)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
