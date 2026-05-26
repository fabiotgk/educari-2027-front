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
import { classLabel, subjectLabel, teacherLabel, type ClassDiary, classDiaryStatusLabel } from './types';
import type { Column } from '@/components/crud/data-table';

interface ColumnActions {
  onView: (diary: ClassDiary) => void;
  onEdit: (diary: ClassDiary) => void;
  onDelete: (diary: ClassDiary) => void;
}

export function buildClassDiaryColumns({ onView, onEdit, onDelete }: ColumnActions): Column<ClassDiary>[] {
  return [
    {
      id: 'academic_year',
      header: 'Ano letivo',
      cell: (diary) => <span className="font-mono text-xs font-semibold">{diary.academic_year}</span>,
      sortValue: (diary) => diary.academic_year,
      exportValue: (diary) => diary.academic_year,
    },
    {
      id: 'class',
      header: 'Turma',
      cell: (diary) => <span className="font-medium">{classLabel(diary.class)}</span>,
      sortValue: (diary) => classLabel(diary.class),
      exportValue: (diary) => classLabel(diary.class),
    },
    {
      id: 'subject',
      header: 'Componente',
      cell: (diary) => <span>{subjectLabel(diary.subject)}</span>,
      sortValue: (diary) => subjectLabel(diary.subject),
      exportValue: (diary) => subjectLabel(diary.subject),
      defaultHidden: true,
    },
    {
      id: 'teacher',
      header: 'Professor',
      cell: (diary) => <span>{teacherLabel(diary.teacher)}</span>,
      sortValue: (diary) => teacherLabel(diary.teacher),
      exportValue: (diary) => teacherLabel(diary.teacher),
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (diary) => (
        <Badge variant={diary.is_active ? 'default' : 'secondary'}>{classDiaryStatusLabel(diary.is_active)}</Badge>
      ),
      sortValue: (diary) => (diary.is_active ? 'Ativo' : 'Inativo'),
      exportValue: (diary) => classDiaryStatusLabel(diary.is_active),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (diary) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(diary)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(diary)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(diary)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
