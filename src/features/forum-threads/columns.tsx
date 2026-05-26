'use client';

import { Eye, Lock, MoreHorizontal, Pencil, Pin, Trash2 } from 'lucide-react';

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
import type { ForumThread } from './types';

export function ForumThreadFlags({ thread }: { thread: Pick<ForumThread, 'is_pinned' | 'is_locked'> }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {thread.is_pinned && (
        <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-700">
          <Pin className="size-3" /> Fixado
        </Badge>
      )}
      {thread.is_locked && (
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700">
          <Lock className="size-3" /> Bloqueado
        </Badge>
      )}
      {!thread.is_pinned && !thread.is_locked && <Badge variant="secondary">Aberto</Badge>}
    </div>
  );
}

interface ColumnActions {
  onView: (thread: ForumThread) => void;
  onEdit: (thread: ForumThread) => void;
  onDelete: (thread: ForumThread) => void;
}

export function buildForumThreadColumns({ onView, onEdit, onDelete }: ColumnActions): Column<ForumThread>[] {
  return [
    {
      id: 'title',
      header: 'Tópico',
      cell: (thread) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{thread.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {thread.author?.name ?? thread.author_id ?? 'Autor não informado'}
          </p>
        </div>
      ),
      sortValue: (thread) => thread.title,
      exportValue: (thread) => thread.title,
    },
    {
      id: 'course_id',
      header: 'Curso',
      cell: (thread) => <span className="font-mono text-xs">{thread.course_id ?? '—'}</span>,
      sortValue: (thread) => thread.course_id,
      exportValue: (thread) => thread.course_id,
      defaultHidden: true,
    },
    {
      id: 'replies_count',
      header: 'Respostas',
      cell: (thread) => thread.replies_count ?? 0,
      sortValue: (thread) => thread.replies_count ?? 0,
      exportValue: (thread) => thread.replies_count ?? 0,
    },
    {
      id: 'views_count',
      header: 'Visualizações',
      cell: (thread) => thread.views_count ?? 0,
      sortValue: (thread) => thread.views_count ?? 0,
      exportValue: (thread) => thread.views_count ?? 0,
    },
    {
      id: 'last_reply_at',
      header: 'Última resposta',
      cell: (thread) => formatDateTime(thread.last_reply_at),
      sortValue: (thread) => thread.last_reply_at,
      exportValue: (thread) => formatDateTime(thread.last_reply_at),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (thread) => <ForumThreadFlags thread={thread} />,
      exportValue: (thread) =>
        [thread.is_pinned ? 'Fixado' : null, thread.is_locked ? 'Bloqueado' : null]
          .filter(Boolean)
          .join(', ') || 'Aberto',
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (thread) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(thread)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(thread)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(thread)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
