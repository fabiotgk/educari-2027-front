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
import type { LmsQuiz } from './types';

interface ColumnActions {
  onView: (quiz: LmsQuiz) => void;
  onEdit: (quiz: LmsQuiz) => void;
  onDelete: (quiz: LmsQuiz) => void;
}

export function QuizPublishedBadge({ published }: { published: boolean }) {
  return <Badge variant={published ? 'default' : 'secondary'}>{published ? 'Publicado' : 'Rascunho'}</Badge>;
}

export function buildLmsQuizColumns({ onView, onEdit, onDelete }: ColumnActions): Column<LmsQuiz>[] {
  return [
    {
      id: 'title',
      header: 'Avaliação',
      cell: (q) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{q.title}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{q.lesson_id ?? q.course_id ?? 'Sem vínculo'}</p>
        </div>
      ),
      sortValue: (q) => q.title,
      exportValue: (q) => q.title,
    },
    {
      id: 'passing_score',
      header: 'Nota de corte',
      cell: (q) => `${q.passing_score}%`,
      sortValue: (q) => Number(q.passing_score),
      exportValue: (q) => q.passing_score,
    },
    {
      id: 'max_attempts',
      header: 'Tentativas',
      cell: (q) => q.max_attempts,
      sortValue: (q) => q.max_attempts,
      exportValue: (q) => q.max_attempts,
    },
    {
      id: 'time_limit_minutes',
      header: 'Tempo',
      cell: (q) => (q.time_limit_minutes != null ? `${q.time_limit_minutes} min` : 'Sem limite'),
      sortValue: (q) => q.time_limit_minutes,
      exportValue: (q) => q.time_limit_minutes,
    },
    {
      id: 'published',
      header: 'Publicação',
      cell: (q) => <QuizPublishedBadge published={q.is_published} />,
      sortValue: (q) => Number(q.is_published),
      exportValue: (q) => (q.is_published ? 'Publicado' : 'Rascunho'),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (q) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(q)}><Eye /> Ver detalhes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(q)}><Pencil /> Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(q)}><Trash2 /> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
