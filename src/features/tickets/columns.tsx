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
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from './types';

const PRIORITY_STYLE: Record<TicketPriority, string> = {
  low: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  normal: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  high: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  critical: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

const STATUS_STYLE: Record<TicketStatus, string> = {
  open: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  in_progress: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  waiting_requester: 'border-purple-500/30 bg-purple-500/10 text-purple-700',
  resolved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  closed: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-700',
};

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <Badge variant="outline" className={cn(PRIORITY_STYLE[priority])}>
      {TICKET_PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {TICKET_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (t: Ticket) => void;
  onEdit: (t: Ticket) => void;
  onDelete: (t: Ticket) => void;
}

export function buildTicketColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<Ticket>[] {
  return [
    {
      id: 'subject',
      header: 'Assunto',
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{t.subject}</p>
          {t.category && (
            <p className="truncate text-xs text-muted-foreground">{t.category.name}</p>
          )}
        </div>
      ),
      sortValue: (t) => t.subject,
      exportValue: (t) => t.subject,
    },
    {
      id: 'priority',
      header: 'Prioridade',
      cell: (t) => <TicketPriorityBadge priority={t.priority} />,
      sortValue: (t) => TICKET_PRIORITY_LABELS[t.priority],
      exportValue: (t) => TICKET_PRIORITY_LABELS[t.priority],
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (t) => <TicketStatusBadge status={t.status} />,
      sortValue: (t) => TICKET_STATUS_LABELS[t.status],
      exportValue: (t) => TICKET_STATUS_LABELS[t.status],
    },
    {
      id: 'requester',
      header: 'Solicitante',
      cell: (t) => <span className="text-sm">{t.requester?.name ?? '—'}</span>,
      sortValue: (t) => t.requester?.name,
      exportValue: (t) => t.requester?.name ?? '',
    },
    {
      id: 'assignee',
      header: 'Responsável',
      cell: (t) => <span className="text-sm">{t.assignee?.name ?? 'Não atribuído'}</span>,
      sortValue: (t) => t.assignee?.name,
      exportValue: (t) => t.assignee?.name ?? '',
      defaultHidden: true,
    },
    {
      id: 'opened_at',
      header: 'Aberto em',
      cell: (t) => (
        <span className="tabular-nums text-xs">
          {t.opened_at ? formatDateTime(t.opened_at) : '—'}
        </span>
      ),
      sortValue: (t) => t.opened_at,
      exportValue: (t) => t.opened_at ?? '',
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (t) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(t)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(t)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(t)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
