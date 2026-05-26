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
import { formatDate } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  TRANSFER_EVENT_STATUS_LABELS,
  type TransferEvent,
  type TransferEventStatus,
} from './types';

const STATUS_STYLE: Record<TransferEventStatus, string> = {
  draft: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
  open: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  classified: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  executed: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  published: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function TransferEventStatusBadge({ status }: { status: TransferEventStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {TRANSFER_EVENT_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (e: TransferEvent) => void;
  onEdit: (e: TransferEvent) => void;
  onDelete: (e: TransferEvent) => void;
}

export function buildTransferEventColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<TransferEvent>[] {
  return [
    {
      id: 'academic_year',
      header: 'Ano letivo',
      cell: (e) => <span className="font-mono text-xs">{e.academic_year}</span>,
      sortValue: (e) => e.academic_year,
      exportValue: (e) => e.academic_year,
    },
    {
      id: 'title',
      header: 'Título do evento',
      cell: (e) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{e.title}</p>
          {e.act_reference && (
            <p className="truncate text-xs text-muted-foreground">Ato: {e.act_reference}</p>
          )}
        </div>
      ),
      sortValue: (e) => e.title,
      exportValue: (e) => e.title,
    },
    {
      id: 'event_date',
      header: 'Data do evento',
      cell: (e) => formatDate(e.event_date),
      sortValue: (e) => e.event_date,
      exportValue: (e) => formatDate(e.event_date),
    },
    {
      id: 'reason',
      header: 'Motivo',
      cell: (e) => <span className="text-sm">{e.reason ?? '—'}</span>,
      sortValue: (e) => e.reason,
      exportValue: (e) => e.reason ?? '',
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (e) => <TransferEventStatusBadge status={e.status} />,
      sortValue: (e) => TRANSFER_EVENT_STATUS_LABELS[e.status],
      exportValue: (e) => TRANSFER_EVENT_STATUS_LABELS[e.status],
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
