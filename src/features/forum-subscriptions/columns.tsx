'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import type { Column } from '@/components/crud/data-table';
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
import type { ForumSubscription } from './types';

export function NotifyBadge({ notify }: { notify: boolean }) {
  return <Badge variant={notify ? 'default' : 'secondary'}>{notify ? 'Notifica' : 'Silenciosa'}</Badge>;
}

interface ColumnActions {
  onView: (subscription: ForumSubscription) => void;
  onEdit: (subscription: ForumSubscription) => void;
  onDelete: (subscription: ForumSubscription) => void;
}

export function buildForumSubscriptionColumns({ onView, onEdit, onDelete }: ColumnActions): Column<ForumSubscription>[] {
  return [
    {
      id: 'user',
      header: 'Usuário',
      cell: (subscription) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{subscription.user?.name ?? subscription.user_id ?? 'Usuário atual'}</p>
          <p className="truncate text-xs text-muted-foreground">{subscription.user?.email ?? 'E-mail não informado'}</p>
        </div>
      ),
      sortValue: (subscription) => subscription.user?.name ?? subscription.user_id,
      exportValue: (subscription) => subscription.user?.name ?? subscription.user_id,
    },
    {
      id: 'forum_thread_id',
      header: 'Tópico',
      cell: (subscription) => <span className="font-mono text-xs">{subscription.thread?.title ?? subscription.forum_thread_id}</span>,
      sortValue: (subscription) => subscription.thread?.title ?? subscription.forum_thread_id,
      exportValue: (subscription) => subscription.thread?.title ?? subscription.forum_thread_id,
    },
    {
      id: 'notify',
      header: 'Notificação',
      cell: (subscription) => <NotifyBadge notify={subscription.notify} />,
      sortValue: (subscription) => (subscription.notify ? 'Notifica' : 'Silenciosa'),
      exportValue: (subscription) => (subscription.notify ? 'Notifica' : 'Silenciosa'),
    },
    {
      id: 'created_at',
      header: 'Criada em',
      cell: (subscription) => formatDateTime(subscription.created_at),
      sortValue: (subscription) => subscription.created_at,
      exportValue: (subscription) => formatDateTime(subscription.created_at),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (subscription) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(subscription)}><Eye /> Ver detalhes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(subscription)}><Pencil /> Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(subscription)}><Trash2 /> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
