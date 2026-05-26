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
import { formatPercent } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  DIFFICULTY_LABELS,
  STATUS_LABELS,
  type LearningPath,
  type LearningPathDifficulty,
  type LearningPathStatus,
} from './types';

const DIFFICULTY_STYLE: Record<LearningPathDifficulty, string> = {
  easy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  medium: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  hard: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

const STATUS_STYLE: Record<LearningPathStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  paused: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  completed: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
};

export function LearningPathDifficultyBadge({ difficulty }: { difficulty: LearningPathDifficulty }) {
  return (
    <Badge variant="outline" className={cn(DIFFICULTY_STYLE[difficulty])}>
      {DIFFICULTY_LABELS[difficulty]}
    </Badge>
  );
}

export function LearningPathStatusBadge({ status }: { status: LearningPathStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (lp: LearningPath) => void;
  onEdit: (lp: LearningPath) => void;
  onDelete: (lp: LearningPath) => void;
}

export function buildLearningPathColumns({ onView, onEdit, onDelete }: ColumnActions): Column<LearningPath>[] {
  return [
    {
      id: 'title',
      header: 'Título da trilha',
      cell: (lp) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{lp.title}</p>
        </div>
      ),
      sortValue: (lp) => lp.title,
      exportValue: (lp) => lp.title,
    },
    {
      id: 'student_id',
      header: 'Aluno (UUID)',
      cell: (lp) => <span className="font-mono text-xs">{lp.student_id ?? '—'}</span>,
      sortValue: (lp) => lp.student_id,
      exportValue: (lp) => lp.student_id,
      defaultHidden: true,
    },
    {
      id: 'subject_id',
      header: 'Disciplina (UUID)',
      cell: (lp) => <span className="font-mono text-xs">{lp.subject_id ?? '—'}</span>,
      sortValue: (lp) => lp.subject_id,
      exportValue: (lp) => lp.subject_id,
      defaultHidden: true,
    },
    {
      id: 'current_level',
      header: 'Nível atual',
      cell: (lp) => lp.current_level ?? '—',
      sortValue: (lp) => lp.current_level,
      exportValue: (lp) => lp.current_level,
    },
    {
      id: 'difficulty',
      header: 'Dificuldade',
      cell: (lp) => (lp.difficulty ? <LearningPathDifficultyBadge difficulty={lp.difficulty} /> : '—'),
      sortValue: (lp) => (lp.difficulty ? DIFFICULTY_LABELS[lp.difficulty] : ''),
      exportValue: (lp) => (lp.difficulty ? DIFFICULTY_LABELS[lp.difficulty] : ''),
    },
    {
      id: 'progress_pct',
      header: 'Progresso',
      cell: (lp) => (
        <span className="tabular-nums">{lp.progress_pct != null ? formatPercent(lp.progress_pct, 0) : '—'}</span>
      ),
      sortValue: (lp) => lp.progress_pct ?? -1,
      exportValue: (lp) => (lp.progress_pct != null ? formatPercent(lp.progress_pct, 0) : ''),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (lp) => (lp.status ? <LearningPathStatusBadge status={lp.status} /> : '—'),
      sortValue: (lp) => (lp.status ? STATUS_LABELS[lp.status] : ''),
      exportValue: (lp) => (lp.status ? STATUS_LABELS[lp.status] : ''),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (lp) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(lp)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(lp)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(lp)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
