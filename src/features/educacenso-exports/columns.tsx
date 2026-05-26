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
import { formatDateTime } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  EDUCACENSO_STAGE_LABELS,
  EDUCACENSO_STATUS_LABELS,
  type EducacensoExport,
  type EducacensoStatus,
} from './types';

const STATUS_STYLE: Record<EducacensoStatus, string> = {
  draft: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
  validating: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  ready: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  exported: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  failed: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function EducacensoStatusBadge({ status }: { status: EducacensoStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {EDUCACENSO_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (e: EducacensoExport) => void;
  onEdit: (e: EducacensoExport) => void;
  onDelete: (e: EducacensoExport) => void;
}

export function buildEducacensoExportColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<EducacensoExport>[] {
  return [
    {
      id: 'reference_year',
      header: 'Ano de referência',
      cell: (e) => <span className="font-mono text-xs">{e.reference_year}</span>,
      sortValue: (e) => String(e.reference_year),
      exportValue: (e) => String(e.reference_year),
    },
    {
      id: 'stage',
      header: 'Etapa',
      cell: (e) => <Badge variant="secondary">{EDUCACENSO_STAGE_LABELS[e.stage]}</Badge>,
      sortValue: (e) => EDUCACENSO_STAGE_LABELS[e.stage],
      exportValue: (e) => EDUCACENSO_STAGE_LABELS[e.stage],
    },
    {
      id: 'record_count',
      header: 'Registros',
      cell: (e) => (
        <span className="tabular-nums">{e.record_count != null ? e.record_count : '—'}</span>
      ),
      sortValue: (e) => e.record_count,
      exportValue: (e) => String(e.record_count ?? ''),
    },
    {
      id: 'generated_at',
      header: 'Gerado em',
      cell: (e) => formatDateTime(e.generated_at),
      sortValue: (e) => e.generated_at,
      exportValue: (e) => formatDateTime(e.generated_at),
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (e) => <EducacensoStatusBadge status={e.status} />,
      sortValue: (e) => EDUCACENSO_STATUS_LABELS[e.status],
      exportValue: (e) => EDUCACENSO_STATUS_LABELS[e.status],
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (e) => (
        <div onClick={(ev) => ev.stopPropagation()} className="flex justify-end">
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
