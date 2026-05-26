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
import type { QuizAnswer } from './types';

interface ColumnActions {
  onView: (answer: QuizAnswer) => void;
  onEdit: (answer: QuizAnswer) => void;
  onDelete: (answer: QuizAnswer) => void;
}

export function AnswerCorrectBadge({ correct }: { correct: boolean | null }) {
  if (correct === null) return <Badge variant="secondary">Sem correção</Badge>;
  return <Badge variant={correct ? 'default' : 'destructive'}>{correct ? 'Correta' : 'Incorreta'}</Badge>;
}

export function buildQuizAnswerColumns({ onView, onEdit, onDelete }: ColumnActions): Column<QuizAnswer>[] {
  return [
    {
      id: 'question',
      header: 'Questão',
      cell: (a) => (
        <div className="min-w-0">
          <p className="line-clamp-2 font-medium">{a.question?.statement ?? a.lms_question_id}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{a.quiz_attempt_id}</p>
        </div>
      ),
      sortValue: (a) => a.question?.statement ?? a.lms_question_id,
      exportValue: (a) => a.question?.statement ?? a.lms_question_id,
    },
    {
      id: 'is_correct',
      header: 'Correção',
      cell: (a) => <AnswerCorrectBadge correct={a.is_correct} />,
      sortValue: (a) => (a.is_correct === null ? 0 : a.is_correct ? 2 : 1),
      exportValue: (a) => (a.is_correct === null ? 'Sem correção' : a.is_correct ? 'Correta' : 'Incorreta'),
    },
    {
      id: 'score_awarded',
      header: 'Pontuação',
      cell: (a) => a.score_awarded ?? '—',
      sortValue: (a) => (a.score_awarded != null ? Number(a.score_awarded) : null),
      exportValue: (a) => a.score_awarded,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (a) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Ações"><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(a)}><Eye /> Ver detalhes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(a)}><Pencil /> Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(a)}><Trash2 /> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
