import * as React from 'react';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/crud/data-table';
import { formatNumber } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GRADE_KIND_LABELS, type Grade, type GradeKind } from './types';

interface GradeActions {
  onView: (grade: Grade) => void;
  onEdit: (grade: Grade) => void;
  onDelete: (grade: Grade) => void;
}

const KIND_VARIANT: Record<GradeKind, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  period: 'default',
  activity: 'secondary',
  recovery: 'destructive',
};

function formatScore(score: number | string | null, concept: string | null): string {
  if (score != null) {
    const numeric = typeof score === 'number' ? score : Number(score);
    if (Number.isFinite(numeric)) {
      return formatNumber(numeric, 1);
    }
  }

  return concept?.trim() || '—';
}

export function buildGradeColumns({ onView, onEdit, onDelete }: GradeActions): Column<Grade>[] {
  return [
    {
      id: 'enrollment',
      header: 'Matrícula',
      cell: (grade) => <span className="font-mono text-xs">{grade.enrollment_id}</span>,
      sortValue: (grade) => grade.enrollment_id,
      exportValue: (grade) => grade.enrollment_id,
      defaultHidden: true,
    },
    {
      id: 'subject',
      header: 'Disciplina',
      cell: (grade) => <span className="font-medium">{grade.subject?.name ?? grade.subject_id}</span>,
      sortValue: (grade) => grade.subject?.name ?? grade.subject_id,
      exportValue: (grade) => grade.subject?.name ?? grade.subject_id,
    },
    {
      id: 'period',
      header: 'Período',
      cell: (grade) => <span>{grade.evaluation_period?.name ?? grade.evaluation_period_id}</span>,
      sortValue: (grade) => grade.evaluation_period?.name ?? grade.evaluation_period_id,
      exportValue: (grade) => grade.evaluation_period?.name ?? grade.evaluation_period_id,
    },
    {
      id: 'kind',
      header: 'Tipo',
      cell: (grade) => (
        <Badge variant={KIND_VARIANT[grade.kind]}> {GRADE_KIND_LABELS[grade.kind]} </Badge>
      ),
      sortValue: (grade) => GRADE_KIND_LABELS[grade.kind],
      exportValue: (grade) => GRADE_KIND_LABELS[grade.kind],
    },
    {
      id: 'score',
      header: 'Nota',
      cell: (grade) => <span className="tabular-nums">{formatScore(grade.score_numeric, grade.score_concept)}</span>,
      sortValue: (grade) => (grade.score_numeric ?? ''),
      exportValue: (grade) => formatScore(grade.score_numeric, grade.score_concept),
    },
    {
      id: 'concept',
      header: 'Conceito',
      cell: (grade) => <span className="font-mono text-xs">{grade.score_concept ?? '—'}</span>,
      sortValue: (grade) => grade.score_concept,
      exportValue: (grade) => grade.score_concept ?? '',
      defaultHidden: true,
    },
    {
      id: 'recovered',
      header: 'Recuperação',
      cell: (grade) => (
        <Badge variant={grade.is_recovered ? 'destructive' : 'outline'}>
          {grade.is_recovered ? 'Sim' : 'Não'}
        </Badge>
      ),
      sortValue: (grade) => (grade.is_recovered ? 'Sim' : 'Não'),
      exportValue: (grade) => (grade.is_recovered ? 'Sim' : 'Não'),
    },
    {
      id: 'updatedAt',
      header: 'Atualizado em',
      cell: (grade) => grade.updated_at ? <span>{grade.updated_at}</span> : '—',
      sortValue: (grade) => grade.updated_at,
      exportValue: (grade) => grade.updated_at,
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (grade) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(grade)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(grade)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(grade)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
