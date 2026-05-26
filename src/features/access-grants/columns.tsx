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
  SCOPE_TYPE_LABELS,
  STATUS_LABELS,
  type AccessGrant,
  type AccessGrantStatus,
} from './types';

export function deriveStatus(ag: AccessGrant): AccessGrantStatus {
  if (ag.revoked_at) return 'revoked';
  const now = new Date();
  if (ag.expires_at && new Date(ag.expires_at) < now) return 'expired';
  if (ag.starts_at && new Date(ag.starts_at) > now) return 'pending';
  return 'active';
}

const STATUS_STYLE: Record<AccessGrantStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  revoked: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  expired: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  pending: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
};

export function AccessGrantStatusBadge({ status }: { status: AccessGrantStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (ag: AccessGrant) => void;
  onEdit: (ag: AccessGrant) => void;
  onDelete: (ag: AccessGrant) => void;
}

export function buildAccessGrantColumns({ onView, onEdit, onDelete }: ColumnActions): Column<AccessGrant>[] {
  return [
    {
      id: 'user',
      header: 'Usuário',
      cell: (ag) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{ag.user?.name ?? ag.user_id}</p>
          {ag.user?.email && <p className="truncate text-xs text-muted-foreground">{ag.user.email}</p>}
        </div>
      ),
      sortValue: (ag) => ag.user?.name ?? ag.user_id,
      exportValue: (ag) => ag.user?.name ?? ag.user_id,
    },
    {
      id: 'role',
      header: 'Papel',
      cell: (ag) => <span className="font-medium">{ag.role}</span>,
      sortValue: (ag) => ag.role,
      exportValue: (ag) => ag.role,
    },
    {
      id: 'scope_type',
      header: 'Escopo',
      cell: (ag) => (ag.scope_type ? <Badge variant="secondary">{SCOPE_TYPE_LABELS[ag.scope_type]}</Badge> : '—'),
      sortValue: (ag) => ag.scope_type ?? '',
      exportValue: (ag) => (ag.scope_type ? SCOPE_TYPE_LABELS[ag.scope_type] : ''),
      defaultHidden: true,
    },
    {
      id: 'scope_id',
      header: 'ID do escopo',
      cell: (ag) => <span className="font-mono text-xs">{ag.scope_id ?? '—'}</span>,
      sortValue: (ag) => ag.scope_id,
      exportValue: (ag) => ag.scope_id ?? '',
      defaultHidden: true,
    },
    {
      id: 'granted_by',
      header: 'Concedido por',
      cell: (ag) => (
        <div className="min-w-0">
          <p className="truncate">{ag.granted_by?.name ?? ag.granted_by_user_id ?? '—'}</p>
          {ag.granted_by?.email && <p className="truncate text-xs text-muted-foreground">{ag.granted_by.email}</p>}
        </div>
      ),
      sortValue: (ag) => ag.granted_by?.name ?? ag.granted_by_user_id ?? '',
      exportValue: (ag) => ag.granted_by?.name ?? ag.granted_by_user_id ?? '',
      defaultHidden: true,
    },
    {
      id: 'starts_at',
      header: 'Início',
      cell: (ag) => formatDateTime(ag.starts_at),
      sortValue: (ag) => ag.starts_at,
      exportValue: (ag) => ag.starts_at ?? '',
      defaultHidden: true,
    },
    {
      id: 'expires_at',
      header: 'Expira em',
      cell: (ag) => formatDateTime(ag.expires_at),
      sortValue: (ag) => ag.expires_at,
      exportValue: (ag) => ag.expires_at ?? '',
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (ag) => <AccessGrantStatusBadge status={deriveStatus(ag)} />,
      sortValue: (ag) => STATUS_LABELS[deriveStatus(ag)],
      exportValue: (ag) => STATUS_LABELS[deriveStatus(ag)],
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (ag) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(ag)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(ag)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(ag)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
