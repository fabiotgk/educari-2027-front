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
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Column } from '@/components/crud/data-table';
import { EVASION_ALERT_SCOPE_LABELS, type EvasionAlert } from './types';

function statusStyle(isActive: boolean): string {
  return isActive
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
    : 'border-muted-foreground/30 bg-muted text-muted-foreground';
}

interface ColumnActions {
  onView: (row: EvasionAlert) => void;
  onEdit: (row: EvasionAlert) => void;
  onDelete: (row: EvasionAlert) => void;
}

export function EvasionAlertStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant="outline" className={cn(statusStyle(isActive))}>
      {isActive ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}

export function buildEvasionAlertColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<EvasionAlert>[] {
  return [
    {
      id: 'name',
      header: 'Nome',
      cell: (row) => <span className="font-medium">{row.name}</span>,
      sortValue: (row) => row.name,
      exportValue: (row) => row.name,
    },
    {
      id: 'scope',
      header: 'Escopo',
      cell: (row) => EVASION_ALERT_SCOPE_LABELS[row.scope],
      sortValue: (row) => EVASION_ALERT_SCOPE_LABELS[row.scope],
      exportValue: (row) => EVASION_ALERT_SCOPE_LABELS[row.scope],
    },
    {
      id: 'school_id',
      header: 'Escola',
      cell: (row) => (row.school_id ? row.school_id : 'Não vinculada'),
      sortValue: (row) => row.school_id,
      exportValue: (row) => row.school_id,
      defaultHidden: true,
    },
    {
      id: 'min_attendance_pct',
      header: 'Freq. mín. (%)',
      cell: (row) =>
        row.min_attendance_pct == null ? '—' : `${formatNumber(Number(row.min_attendance_pct), 2)}%`,
      sortValue: (row) => row.min_attendance_pct,
      exportValue: (row) => (row.min_attendance_pct == null ? '' : String(row.min_attendance_pct)),
    },
    {
      id: 'max_consecutive_absences',
      header: 'Faltas consecutivas',
      cell: (row) => row.max_consecutive_absences ?? '—',
      sortValue: (row) => row.max_consecutive_absences,
      exportValue: (row) => row.max_consecutive_absences,
      defaultHidden: true,
    },
    {
      id: 'is_active',
      header: 'Situação',
      cell: (row) => <EvasionAlertStatusBadge isActive={row.is_active} />,
      sortValue: (row) => (row.is_active ? 'Ativo' : 'Inativo'),
      exportValue: (row) => (row.is_active ? 'Ativo' : 'Inativo'),
      className: 'w-28',
    },
    {
      id: 'created_at',
      header: 'Criado em',
      cell: (row) => formatDate(row.created_at),
      sortValue: (row) => row.created_at,
      exportValue: (row) => formatDate(row.created_at),
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (row) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(row)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(row)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
