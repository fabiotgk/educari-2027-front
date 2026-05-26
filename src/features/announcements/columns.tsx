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
  ANNOUNCEMENT_KIND_LABELS,
  ANNOUNCEMENT_PRIORITY_LABELS,
  type Announcement,
  type AnnouncementPriority,
} from './types';

const PRIORITY_STYLE: Record<AnnouncementPriority, string> = {
  low: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  normal: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  high: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  urgent: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function AnnouncementPriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  return (
    <Badge variant="outline" className={cn(PRIORITY_STYLE[priority])}>
      {ANNOUNCEMENT_PRIORITY_LABELS[priority]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (a: Announcement) => void;
  onEdit: (a: Announcement) => void;
  onDelete: (a: Announcement) => void;
}

export function buildAnnouncementColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<Announcement>[] {
  return [
    {
      id: 'title',
      header: 'Título',
      cell: (a) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{a.title}</p>
          {a.summary && (
            <p className="truncate text-xs text-muted-foreground">{a.summary}</p>
          )}
        </div>
      ),
      sortValue: (a) => a.title,
      exportValue: (a) => a.title,
    },
    {
      id: 'kind',
      header: 'Tipo',
      cell: (a) => <Badge variant="secondary">{ANNOUNCEMENT_KIND_LABELS[a.kind]}</Badge>,
      sortValue: (a) => ANNOUNCEMENT_KIND_LABELS[a.kind],
      exportValue: (a) => ANNOUNCEMENT_KIND_LABELS[a.kind],
    },
    {
      id: 'priority',
      header: 'Prioridade',
      cell: (a) => <AnnouncementPriorityBadge priority={a.priority} />,
      sortValue: (a) => ANNOUNCEMENT_PRIORITY_LABELS[a.priority],
      exportValue: (a) => ANNOUNCEMENT_PRIORITY_LABELS[a.priority],
    },
    {
      id: 'published_at',
      header: 'Publicação',
      cell: (a) => (
        <span className="text-xs tabular-nums">
          {a.published_at ? formatDateTime(a.published_at) : '—'}
        </span>
      ),
      sortValue: (a) => a.published_at,
      exportValue: (a) => a.published_at ?? '',
    },
    {
      id: 'expires_at',
      header: 'Expiração',
      cell: (a) => (
        <span className="text-xs tabular-nums">
          {a.expires_at ? formatDateTime(a.expires_at) : '—'}
        </span>
      ),
      sortValue: (a) => a.expires_at,
      exportValue: (a) => a.expires_at ?? '',
      defaultHidden: true,
    },
    {
      id: 'read_confirmation',
      header: 'Conf. leitura',
      cell: (a) => (
        <Badge variant={a.requires_read_confirmation ? 'default' : 'outline'}>
          {a.requires_read_confirmation ? 'Sim' : 'Não'}
        </Badge>
      ),
      exportValue: (a) => (a.requires_read_confirmation ? 'Sim' : 'Não'),
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (a) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(a)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(a)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(a)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
