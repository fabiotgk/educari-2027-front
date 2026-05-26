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
import { lessonPlanApprovalLabel, lessonPlanApprovalVariant, type LessonPlan } from './types';

interface ColumnActions {
  onView: (plan: LessonPlan) => void;
  onEdit: (plan: LessonPlan) => void;
  onDelete: (plan: LessonPlan) => void;
}

export function buildLessonPlanColumns({ onView, onEdit, onDelete }: ColumnActions): Column<LessonPlan>[] {
  return [
    {
      id: 'evaluation_period',
      header: 'Período',
      cell: (plan) => <span className="font-mono text-xs">{plan.evaluation_period_id}</span>,
      sortValue: (plan) => plan.evaluation_period_id,
      exportValue: (plan) => plan.evaluation_period_id,
    },
    {
      id: 'class_diary',
      header: 'Diário',
      cell: (plan) => plan.class_diary_id,
      sortValue: (plan) => plan.class_diary_id,
      exportValue: (plan) => plan.class_diary_id,
      defaultHidden: true,
    },
    {
      id: 'planned',
      header: 'Aulas planejadas',
      cell: (plan) => plan.planned_lessons,
      sortValue: (plan) => plan.planned_lessons,
      exportValue: (plan) => plan.planned_lessons,
    },
    {
      id: 'taught',
      header: 'Aulas ministradas',
      cell: (plan) => plan.taught_lessons ?? '—',
      sortValue: (plan) => plan.taught_lessons ?? 0,
      exportValue: (plan) => plan.taught_lessons ?? '',
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (plan) => (
        <Badge variant={lessonPlanApprovalVariant(plan.approval_status)}>
          {lessonPlanApprovalLabel(plan.approval_status)}
        </Badge>
      ),
      sortValue: (plan) => lessonPlanApprovalLabel(plan.approval_status),
      exportValue: (plan) => lessonPlanApprovalLabel(plan.approval_status),
    },
    {
      id: 'updated_at',
      header: 'Atualizado em',
      cell: (plan) => formatDate(plan.updated_at),
      sortValue: (plan) => plan.updated_at,
      exportValue: (plan) => formatDate(plan.updated_at),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (plan) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(plan)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(plan)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(plan)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
