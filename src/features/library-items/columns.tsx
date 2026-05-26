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
import { LIBRARY_ITEM_KIND_LABELS, type LibraryItem } from './types';

interface ColumnActions {
  onView: (item: LibraryItem) => void;
  onEdit: (item: LibraryItem) => void;
  onDelete: (item: LibraryItem) => void;
}

export function buildLibraryItemColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<LibraryItem>[] {
  return [
    {
      id: 'title',
      header: 'Título',
      cell: (item) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{item.title}</p>
          {item.author && (
            <p className="truncate text-xs text-muted-foreground">{item.author}</p>
          )}
        </div>
      ),
      sortValue: (item) => item.title,
      exportValue: (item) => item.title,
    },
    {
      id: 'kind',
      header: 'Tipo',
      cell: (item) => (
        <Badge variant="secondary">{LIBRARY_ITEM_KIND_LABELS[item.kind]}</Badge>
      ),
      sortValue: (item) => LIBRARY_ITEM_KIND_LABELS[item.kind],
      exportValue: (item) => LIBRARY_ITEM_KIND_LABELS[item.kind],
    },
    {
      id: 'isbn',
      header: 'ISBN',
      cell: (item) => (
        <span className="font-mono text-xs">{item.isbn ?? '—'}</span>
      ),
      exportValue: (item) => item.isbn ?? '',
      defaultHidden: true,
    },
    {
      id: 'publisher',
      header: 'Editora',
      cell: (item) => <span className="text-sm">{item.publisher ?? '—'}</span>,
      sortValue: (item) => item.publisher,
      exportValue: (item) => item.publisher ?? '',
      defaultHidden: true,
    },
    {
      id: 'shelf_code',
      header: 'Prateleira',
      cell: (item) => (
        <span className="font-mono text-xs">{item.shelf_code ?? '—'}</span>
      ),
      exportValue: (item) => item.shelf_code ?? '',
    },
    {
      id: 'copies',
      header: 'Cópias',
      cell: (item) => (
        <span className="tabular-nums text-sm">
          {item.copies_available}/{item.copies_total}
        </span>
      ),
      sortValue: (item) => item.copies_available,
      exportValue: (item) => `${item.copies_available}/${item.copies_total}`,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (item) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(item)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
