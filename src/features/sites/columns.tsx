'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

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
import { SITE_OWNER_TYPE_LABELS, type Site } from './types';

interface ColumnActions {
  onView: (s: Site) => void;
  onEdit: (s: Site) => void;
  onDelete: (s: Site) => void;
}

export function buildSiteColumns({ onView, onEdit, onDelete }: ColumnActions): Column<Site>[] {
  return [
    {
      id: 'slug',
      header: 'Slug',
      cell: (s) => <span className="font-mono text-xs">{s.slug}</span>,
      sortValue: (s) => s.slug,
      exportValue: (s) => s.slug,
    },
    {
      id: 'name',
      header: 'Nome do site',
      cell: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{s.name}</p>
          {s.subdomain && (
            <p className="truncate text-xs text-muted-foreground">{s.subdomain}.educari.com.br</p>
          )}
        </div>
      ),
      sortValue: (s) => s.name,
      exportValue: (s) => s.name,
    },
    {
      id: 'owner_type',
      header: 'Tipo de dono',
      cell: (s) =>
        s.owner_type ? (
          <Badge variant="secondary">{SITE_OWNER_TYPE_LABELS[s.owner_type]}</Badge>
        ) : (
          '—'
        ),
      sortValue: (s) => (s.owner_type ? SITE_OWNER_TYPE_LABELS[s.owner_type] : ''),
      exportValue: (s) => (s.owner_type ? SITE_OWNER_TYPE_LABELS[s.owner_type] : ''),
    },
    {
      id: 'custom_domain',
      header: 'Domínio personalizado',
      cell: (s) => <span className="text-xs">{s.custom_domain ?? '—'}</span>,
      exportValue: (s) => s.custom_domain ?? '',
      defaultHidden: true,
    },
    {
      id: 'is_published',
      header: 'Publicado',
      cell: (s) => (
        <Badge
          variant="outline"
          className={
            s.is_published
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
              : 'border-slate-500/30 bg-slate-500/10 text-slate-700'
          }
        >
          {s.is_published ? 'Publicado' : 'Rascunho'}
        </Badge>
      ),
      sortValue: (s) => (s.is_published ? 'Publicado' : 'Rascunho'),
      exportValue: (s) => (s.is_published ? 'Publicado' : 'Rascunho'),
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
