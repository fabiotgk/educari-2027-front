'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
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
import { QUIZ_ATTEMPT_STATUS_LABELS, type QuizAttempt, type QuizAttemptStatus } from './types';

const STATUS_STYLE: Record<QuizAttemptStatus, string> = {
  in_progress: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  submitted: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  graded: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
};

interface ColumnActions {
  onView: (attempt: QuizAttempt) => void;
  onEdit: (attempt: QuizAttempt) => void;
  onDelete: (attempt: QuizAttempt) => void;
}

export function AttemptStatusBadge({ status }: { status: QuizAttemptStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {QUIZ_ATTEMPT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function PassedBadge({ passed }: { passed: boolean | null }) {
  if (passed === null) return <Badge variant="secondary">Não avaliada</Badge>;
  return <Badge variant={passed ? 'default' : 'destructive'}>{passed ? 'Aprovada' : 'Reprovada'}</Badge>;
}

export function buildQuizAttemptColumns({ onView, onEdit, onDelete }: ColumnActions): Column<QuizAttempt>[] {
  return [
    {
      id: 'attempt_number',
      header: 'Tentativa',
      cell: (a) => <span className="font-mono text-xs">#{a.attempt_number}</span>,
      sortValue: (a) => a.attempt_number,
      exportValue: (a) => a.attempt_number,
    },
    {
      id: 'quiz',
      header: 'Avaliação',
      cell: (a) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{a.quiz?.title ?? a.lms_quiz_id}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{a.student_id ?? a.user_id ?? 'Sem participante'}</p>
        </div>
      ),
      sortValue: (a) => a.quiz?.title ?? a.lms_quiz_id,
      exportValue: (a) => a.quiz?.title ?? a.lms_quiz_id,
    },
    {
      id: 'score',
      header: 'Pontuação',
      cell: (a) => a.score ?? '—',
      sortValue: (a) => (a.score != null ? Number(a.score) : null),
      exportValue: (a) => a.score,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (a) => <AttemptStatusBadge status={a.status} />,
      sortValue: (a) => QUIZ_ATTEMPT_STATUS_LABELS[a.status],
      exportValue: (a) => QUIZ_ATTEMPT_STATUS_LABELS[a.status],
    },
    {
      id: 'passed',
      header: 'Resultado',
      cell: (a) => <PassedBadge passed={a.passed} />,
      sortValue: (a) => (a.passed === null ? 0 : a.passed ? 2 : 1),
      exportValue: (a) => (a.passed === null ? 'Não avaliada' : a.passed ? 'Aprovada' : 'Reprovada'),
    },
    {
      id: 'submitted_at',
      header: 'Envio',
      cell: (a) => formatDateTime(a.submitted_at),
      sortValue: (a) => a.submitted_at,
      exportValue: (a) => a.submitted_at,
      defaultHidden: true,
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
