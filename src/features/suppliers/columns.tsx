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
import { formatCnpj } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import type { Supplier } from './types';

export function SupplierStatusBadge({ active }: { active: boolean }) {
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
  onView: (s: Supplier) => void;
  onEdit: (s: Supplier) => void;
  onDelete: (s: Supplier) => void;
}

export function buildSupplierColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<Supplier>[] {
  return [
    {
      id: 'name',
      header: 'Fornecedor',
      cell: (s) => <span className="font-medium">{s.name}</span>,
      sortValue: (s) => s.name,
      exportValue: (s) => s.name,
    },
    {
      id: 'cnpj',
      header: 'CNPJ',
      cell: (s) => (
        <span className="font-mono text-xs">{s.cnpj ? formatCnpj(s.cnpj) : '—'}</span>
      ),
      exportValue: (s) => (s.cnpj ? formatCnpj(s.cnpj) : ''),
    },
    {
      id: 'is_regional',
      header: 'Regional',
      cell: (s) =>
        s.is_regional ? (
          <Badge variant="secondary">Sim</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Não</span>
        ),
      sortValue: (s) => (s.is_regional ? 'Sim' : 'Não'),
      exportValue: (s) => (s.is_regional ? 'Sim' : 'Não'),
    },
    {
      id: 'email',
      header: 'E-mail',
      cell: (s) => <span className="text-xs">{s.email ?? '—'}</span>,
      exportValue: (s) => s.email ?? '',
      defaultHidden: true,
    },
    {
      id: 'phone',
      header: 'Telefone',
      cell: (s) => <span className="text-xs">{s.phone ?? '—'}</span>,
      exportValue: (s) => s.phone ?? '',
      defaultHidden: true,
    },
    {
      id: 'city',
      header: 'Município',
      cell: (s) =>
        s.address?.cidade ? (
          <span>
            {s.address.cidade}
            {s.address.uf ? `/${s.address.uf}` : ''}
          </span>
        ) : (
          '—'
        ),
      sortValue: (s) => s.address?.cidade,
      exportValue: (s) =>
        s.address?.cidade
          ? `${s.address.cidade}${s.address.uf ? '/' + s.address.uf : ''}`
          : '',
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (s) => <SupplierStatusBadge active={s.is_active} />,
      sortValue: (s) => (s.is_active ? 'Ativo' : 'Inativo'),
      exportValue: (s) => (s.is_active ? 'Ativo' : 'Inativo'),
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
