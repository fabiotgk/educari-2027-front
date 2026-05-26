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
import type { ForumReply } from './types';

export function ForumReplySolutionBadge({ isSolution }: { isSolution: boolean }) {
  return <Badge variant={isSolution ? 'default' : 'secondary'}>{isSolution ? 'Solução' : 'Resposta'}</Badge>;
}

interface ColumnActions {
  onView: (reply: ForumReply) => void;
  onEdit: (reply: ForumReply) => void;
  onDelete: (reply: ForumReply) => void;
}

export function buildForumReplyColumns({ onView, onEdit, onDelete }: ColumnActions): Column<ForumReply>[] {
  return [
    {
      id: 'body',
      header: 'Resposta',
      cell: (reply) => (
        <div className="min-w-0">
          <p className="line-clamp-2 font-medium">{reply.body}</p>
          <p className="truncate text-xs text-muted-foreground">{reply.author?.name ?? reply.author_id ?? 'Autor não informado'}</p>
        </div>
      ),
      sortValue: (reply) => reply.body,
      exportValue: (reply) => reply.body,
    },
    {
      id: 'forum_thread_id',
      header: 'Tópico',
      cell: (reply) => <span className="font-mono text-xs">{reply.thread?.title ?? reply.forum_thread_id}</span>,
      sortValue: (reply) => reply.thread?.title ?? reply.forum_thread_id,
      exportValue: (reply) => reply.thread?.title ?? reply.forum_thread_id,
    },
    {
      id: 'is_solution',
      header: 'Tipo',
      cell: (reply) => <ForumReplySolutionBadge isSolution={reply.is_solution} />,
      sortValue: (reply) => (reply.is_solution ? 'Solução' : 'Resposta'),
      exportValue: (reply) => (reply.is_solution ? 'Solução' : 'Resposta'),
    },
    {
      id: 'created_at',
      header: 'Criada em',
      cell: (reply) => formatDateTime(reply.created_at),
      sortValue: (reply) => reply.created_at,
      exportValue: (reply) => formatDateTime(reply.created_at),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (reply) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(reply)}><Eye /> Ver detalhes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(reply)}><Pencil /> Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(reply)}><Trash2 /> Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
