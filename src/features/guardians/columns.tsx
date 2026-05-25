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
import { maskPhone } from '@/lib/masks';
import type { Column } from '@/components/crud/data-table';
import type { Guardian } from './types';

interface ColumnActions {
  onView: (g: Guardian) => void;
  onEdit: (g: Guardian) => void;
  onDelete: (g: Guardian) => void;
}

export function buildGuardianColumns({ onView, onEdit, onDelete }: ColumnActions): Column<Guardian>[] {
  return [
    {
      id: 'full_name',
      header: 'Nome',
      cell: (g) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{g.full_name}</p>
          {g.occupation && (
            <p className="truncate text-xs text-muted-foreground">{g.occupation}</p>
          )}
        </div>
      ),
      sortValue: (g) => g.full_name,
      exportValue: (g) => g.full_name,
    },
    {
      id: 'email',
      header: 'E-mail',
      cell: (g) => <span className="text-sm">{g.email ?? '—'}</span>,
      sortValue: (g) => g.email,
      exportValue: (g) => g.email,
    },
    {
      id: 'phone_primary',
      header: 'Telefone',
      cell: (g) => (
        <span className="text-sm">
          {g.phone_primary ? maskPhone(g.phone_primary) : '—'}
        </span>
      ),
      exportValue: (g) => (g.phone_primary ? maskPhone(g.phone_primary) : ''),
    },
    {
      id: 'city',
      header: 'Município',
      cell: (g) =>
        g.address?.cidade ? (
          <span>
            {g.address.cidade}
            {g.address.uf ? `/${g.address.uf}` : ''}
          </span>
        ) : (
          '—'
        ),
      sortValue: (g) => g.address?.cidade,
      exportValue: (g) =>
        g.address?.cidade
          ? `${g.address.cidade}${g.address.uf ? '/' + g.address.uf : ''}`
          : '',
    },
    {
      id: 'whatsapp',
      header: 'WhatsApp',
      cell: (g) => (
        <span className="text-sm">
          {g.whatsapp ? maskPhone(g.whatsapp) : '—'}
        </span>
      ),
      exportValue: (g) => (g.whatsapp ? maskPhone(g.whatsapp) : ''),
      defaultHidden: true,
    },
    {
      id: 'pii',
      header: 'PII',
      cell: (g) =>
        g.has_pii ? (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700">
            Protegido
          </Badge>
        ) : null,
      exportValue: () => '',
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (g) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(g)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(g)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(g)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
