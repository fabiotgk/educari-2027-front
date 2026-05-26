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
import { evaluationPeriodStatusLabel } from './types';
import type { EvaluationPeriod } from './types';

interface ColumnActions {
  onView: (period: EvaluationPeriod) => void;
  onEdit: (period: EvaluationPeriod) => void;
  onDelete: (period: EvaluationPeriod) => void;
}

export function buildEvaluationPeriodColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<EvaluationPeriod>[] {
  return [
    {
      id: 'code',
      header: 'Código',
      cell: (period) => <span className="font-mono text-xs font-semibold">{period.code}</span>,
      sortValue: (period) => period.code,
      exportValue: (period) => period.code,
    },
    {
      id: 'name',
      header: 'Nome',
      cell: (period) => period.name,
      sortValue: (period) => period.name,
      exportValue: (period) => period.name,
      defaultHidden: true,
    },
    {
      id: 'academic_year',
      header: 'Ano letivo',
      cell: (period) => period.academic_year,
      sortValue: (period) => period.academic_year,
      exportValue: (period) => period.academic_year,
    },
    {
      id: 'school',
      header: 'Escola',
      cell: (period) => period.school_id ?? '—',
      sortValue: (period) => period.school_id ?? '',
      exportValue: (period) => period.school_id ?? '',
      defaultHidden: true,
    },
    {
      id: 'period',
      header: 'Período',
      cell: (period) => `${formatDate(period.starts_at)} · ${formatDate(period.ends_at)}`,
      sortValue: (period) => `${period.starts_at ?? ''}${period.ends_at ?? ''}`,
      exportValue: (period) => `${period.starts_at ?? ''} · ${period.ends_at ?? ''}`,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (period) => <Badge variant={period.is_closed ? 'secondary' : 'default'}>{evaluationPeriodStatusLabel(period.is_closed)}</Badge>,
      sortValue: (period) => (period.is_closed ? 'Fechado' : 'Aberto'),
      exportValue: (period) => (period.is_closed ? 'Fechado' : 'Aberto'),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (period) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(period)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(period)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(period)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
