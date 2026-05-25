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
import { formatCnpj } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  SCHOOL_STATUS_LABELS,
  SCHOOL_TYPE_LABELS,
  type School,
  type SchoolStatus,
} from './types';

const STATUS_STYLE: Record<SchoolStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  suspended: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  closed: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function SchoolStatusBadge({ status }: { status: SchoolStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {SCHOOL_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (s: School) => void;
  onEdit: (s: School) => void;
  onDelete: (s: School) => void;
}

export function buildSchoolColumns({ onView, onEdit, onDelete }: ColumnActions): Column<School>[] {
  return [
    {
      id: 'code',
      header: 'Código',
      cell: (s) => <span className="font-mono text-xs">{s.code ?? '—'}</span>,
      sortValue: (s) => s.code,
      exportValue: (s) => s.code,
    },
    {
      id: 'name',
      header: 'Escola',
      cell: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{s.name}</p>
          {s.short_name && <p className="truncate text-xs text-muted-foreground">{s.short_name}</p>}
        </div>
      ),
      sortValue: (s) => s.name,
      exportValue: (s) => s.name,
    },
    {
      id: 'type',
      header: 'Tipo',
      cell: (s) => <Badge variant="secondary">{SCHOOL_TYPE_LABELS[s.type]}</Badge>,
      sortValue: (s) => SCHOOL_TYPE_LABELS[s.type],
      exportValue: (s) => SCHOOL_TYPE_LABELS[s.type],
    },
    {
      id: 'inep_code',
      header: 'INEP',
      cell: (s) => <span className="font-mono text-xs">{s.inep_code ?? '—'}</span>,
      sortValue: (s) => s.inep_code,
      exportValue: (s) => s.inep_code,
      defaultHidden: true,
    },
    {
      id: 'cnpj',
      header: 'CNPJ',
      cell: (s) => <span className="text-xs">{s.cnpj ? formatCnpj(s.cnpj) : '—'}</span>,
      exportValue: (s) => (s.cnpj ? formatCnpj(s.cnpj) : ''),
      defaultHidden: true,
    },
    {
      id: 'city',
      header: 'Município',
      cell: (s) =>
        s.address?.cidade ? (
          <span>
            {s.address.cidade}
            {s.address.uf ? `/${s.address.uf}` : ''}
          </span>
        ) : (
          '—'
        ),
      sortValue: (s) => s.address?.cidade,
      exportValue: (s) =>
        s.address?.cidade ? `${s.address.cidade}${s.address.uf ? '/' + s.address.uf : ''}` : '',
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (s) => <SchoolStatusBadge status={s.operation_status} />,
      sortValue: (s) => SCHOOL_STATUS_LABELS[s.operation_status],
      exportValue: (s) => SCHOOL_STATUS_LABELS[s.operation_status],
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (s) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(s)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(s)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(s)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
