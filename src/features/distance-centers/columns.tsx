'use client';

import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Column } from '@/components/crud/data-table';
import type { DistanceCenter } from './types';

interface ColumnActions {
  onView: (c: DistanceCenter) => void;
  onEdit: (c: DistanceCenter) => void;
  onDelete: (c: DistanceCenter) => void;
}

export function buildDistanceCenterColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<DistanceCenter>[] {
  return [
    {
      id: 'name',
      header: 'Polo EAD',
      cell: (c) => <span className="font-medium">{c.name}</span>,
      sortValue: (c) => c.name,
      exportValue: (c) => c.name,
    },
    {
      id: 'location',
      header: 'Localização',
      cell: (c) => (
        <span className="text-sm">{c.location ?? '—'}</span>
      ),
      sortValue: (c) => c.location,
      exportValue: (c) => c.location ?? '',
    },
    {
      id: 'capacity',
      header: 'Capacidade',
      cell: (c) => (
        <span className="tabular-nums text-sm">
          {c.capacity != null ? c.capacity.toLocaleString('pt-BR') : '—'}
        </span>
      ),
      sortValue: (c) => c.capacity,
      exportValue: (c) => (c.capacity != null ? String(c.capacity) : ''),
    },
    {
      id: 'coordinator_user_id',
      header: 'Coordenador (ID)',
      cell: (c) => (
        <span className="font-mono text-xs text-muted-foreground">
          {c.coordinator_user_id ?? '—'}
        </span>
      ),
      exportValue: (c) => c.coordinator_user_id ?? '',
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (c) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(c)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(c)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(c)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
