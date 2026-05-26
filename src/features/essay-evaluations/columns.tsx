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
import { formatDateTime, formatNumber } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  ESSAY_EVALUATION_STATUS_LABELS,
  type EssayEvaluation,
  type EssayEvaluationStatus,
} from './types';

const STATUS_STYLE: Record<EssayEvaluationStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  processing: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  failed: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function EssayEvaluationStatusBadge({ status }: { status: EssayEvaluationStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {ESSAY_EVALUATION_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (e: EssayEvaluation) => void;
  onEdit: (e: EssayEvaluation) => void;
  onDelete: (e: EssayEvaluation) => void;
}

export function buildEssayEvaluationColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<EssayEvaluation>[] {
  return [
    {
      id: 'student',
      header: 'Aluno',
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{e.student?.full_name ?? '—'}</p>
          {e.student_id && (
            <p className="truncate font-mono text-xs text-muted-foreground">{e.student_id}</p>
          )}
        </div>
      ),
      sortValue: (e) => e.student?.full_name ?? '',
      exportValue: (e) => e.student?.full_name ?? '',
    },
    {
      id: 'prompt_text',
      header: 'Tema/Prompt',
      cell: (e) => (
        <p className="max-w-xs truncate text-sm" title={e.prompt_text}>
          {e.prompt_text}
        </p>
      ),
      sortValue: (e) => e.prompt_text,
      exportValue: (e) => e.prompt_text,
    },
    {
      id: 'score',
      header: 'Nota',
      cell: (e) => (
        <span className="tabular-nums font-semibold">
          {e.score != null ? formatNumber(e.score, 2) : '—'}
        </span>
      ),
      sortValue: (e) => e.score ?? -1,
      exportValue: (e) => (e.score != null ? String(e.score) : ''),
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (e) => <EssayEvaluationStatusBadge status={e.status} />,
      sortValue: (e) => ESSAY_EVALUATION_STATUS_LABELS[e.status],
      exportValue: (e) => ESSAY_EVALUATION_STATUS_LABELS[e.status],
    },
    {
      id: 'evaluated_at',
      header: 'Avaliada em',
      cell: (e) => <span className="text-sm">{formatDateTime(e.evaluated_at)}</span>,
      sortValue: (e) => e.evaluated_at ?? '',
      exportValue: (e) => (e.evaluated_at ? formatDateTime(e.evaluated_at) : ''),
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (e) => (
        <div onClick={(evt) => evt.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(e)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(e)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(e)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
