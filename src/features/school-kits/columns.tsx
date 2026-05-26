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
import {
  SCHOOL_KIT_STATUS_LABELS,
  type SchoolKit,
  type SchoolKitStatus,
} from './types';

const STATUS_STYLE: Record<SchoolKitStatus, string> = {
  planned: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  closed: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
};

export function SchoolKitStatusBadge({ status }: { status: SchoolKitStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {SCHOOL_KIT_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (k: SchoolKit) => void;
  onEdit: (k: SchoolKit) => void;
  onDelete: (k: SchoolKit) => void;
}

export function buildSchoolKitColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<SchoolKit>[] {
  return [
    {
      id: 'academic_year',
      header: 'Ano letivo',
      cell: (k) => <span className="font-mono text-xs font-semibold">{k.academic_year}</span>,
      sortValue: (k) => k.academic_year,
      exportValue: (k) => k.academic_year,
    },
    {
      id: 'name',
      header: 'Kit',
      cell: (k) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{k.name}</p>
          {k.target_stage && (
            <p className="truncate text-xs text-muted-foreground">{k.target_stage}</p>
          )}
        </div>
      ),
      sortValue: (k) => k.name,
      exportValue: (k) => k.name,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (k) => <SchoolKitStatusBadge status={k.status} />,
      sortValue: (k) => SCHOOL_KIT_STATUS_LABELS[k.status],
      exportValue: (k) => SCHOOL_KIT_STATUS_LABELS[k.status],
    },
    {
      id: 'description',
      header: 'Descrição',
      cell: (k) => (
        <span className="line-clamp-1 text-xs text-muted-foreground">
          {k.description ?? '—'}
        </span>
      ),
      exportValue: (k) => k.description ?? '',
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (k) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(k)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(k)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(k)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
