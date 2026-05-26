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
import { LMS_QUESTION_TYPE_LABELS, type LmsQuestion, type LmsQuestionType } from './types';

const TYPE_STYLE: Record<LmsQuestionType, string> = {
  single_choice: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  multiple_choice: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  true_false: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  essay: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
};

interface ColumnActions {
  onView: (question: LmsQuestion) => void;
  onEdit: (question: LmsQuestion) => void;
  onDelete: (question: LmsQuestion) => void;
}

export function QuestionTypeBadge({ type }: { type: LmsQuestionType }) {
  return (
    <Badge variant="outline" className={cn(TYPE_STYLE[type])}>
      {LMS_QUESTION_TYPE_LABELS[type]}
    </Badge>
  );
}

export function buildLmsQuestionColumns({ onView, onEdit, onDelete }: ColumnActions): Column<LmsQuestion>[] {
  return [
    {
      id: 'position',
      header: 'Ordem',
      cell: (q) => <span className="font-mono text-xs">{q.position}</span>,
      sortValue: (q) => q.position,
      exportValue: (q) => q.position,
    },
    {
      id: 'statement',
      header: 'Questão',
      cell: (q) => (
        <div className="min-w-0">
          <p className="line-clamp-2 font-medium">{q.statement}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{q.lms_quiz_id}</p>
        </div>
      ),
      sortValue: (q) => q.statement,
      exportValue: (q) => q.statement,
    },
    {
      id: 'type',
      header: 'Tipo',
      cell: (q) => <QuestionTypeBadge type={q.type} />,
      sortValue: (q) => LMS_QUESTION_TYPE_LABELS[q.type],
      exportValue: (q) => LMS_QUESTION_TYPE_LABELS[q.type],
    },
    {
      id: 'score',
      header: 'Pontuação',
      cell: (q) => q.score,
      sortValue: (q) => Number(q.score),
      exportValue: (q) => q.score,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (q) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Ações"><MoreHorizontal /></Button></DropdownMenuTrigger>
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
