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
import type { Column } from '@/components/crud/data-table';
import { DOCUMENT_KIND_LABELS, type DocumentTemplate } from './types';

export function DocumentActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        active
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
          : 'border-rose-500/30 bg-rose-500/10 text-rose-700',
      )}
    >
      {active ? 'Ativo' : 'Inativo'}
    </Badge>
  );
}

interface ColumnActions {
  onView: (t: DocumentTemplate) => void;
  onEdit: (t: DocumentTemplate) => void;
  onDelete: (t: DocumentTemplate) => void;
}

export function buildDocumentTemplateColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<DocumentTemplate>[] {
  return [
    {
      id: 'name',
      header: 'Nome do template',
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{t.name}</p>
          {t.is_default && (
            <p className="text-xs text-muted-foreground">Template padrão</p>
          )}
        </div>
      ),
      sortValue: (t) => t.name,
      exportValue: (t) => t.name,
    },
    {
      id: 'kind',
      header: 'Tipo',
      cell: (t) => <Badge variant="secondary">{DOCUMENT_KIND_LABELS[t.kind]}</Badge>,
      sortValue: (t) => DOCUMENT_KIND_LABELS[t.kind],
      exportValue: (t) => DOCUMENT_KIND_LABELS[t.kind],
    },
    {
      id: 'version',
      header: 'Versão',
      cell: (t) => <span className="font-mono text-xs">v{t.version}</span>,
      sortValue: (t) => t.version,
      exportValue: (t) => t.version,
    },
    {
      id: 'is_default',
      header: 'Padrão',
      cell: (t) =>
        t.is_default ? (
          <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-700">
            Padrão
          </Badge>
        ) : null,
      exportValue: (t) => (t.is_default ? 'Sim' : 'Não'),
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (t) => <DocumentActiveBadge active={t.is_active} />,
      sortValue: (t) => (t.is_active ? 'Ativo' : 'Inativo'),
      exportValue: (t) => (t.is_active ? 'Ativo' : 'Inativo'),
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
