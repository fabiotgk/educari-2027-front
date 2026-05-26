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
import type { TransportCompany } from './types';

export function TransportCompanyActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        isActive
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
          : 'border-rose-500/30 bg-rose-500/10 text-rose-700',
      )}
    >
      {isActive ? 'Ativa' : 'Inativa'}
    </Badge>
  );
}

interface ColumnActions {
  onView: (c: TransportCompany) => void;
  onEdit: (c: TransportCompany) => void;
  onDelete: (c: TransportCompany) => void;
}

export function buildTransportCompanyColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<TransportCompany>[] {
  return [
    {
      id: 'name',
      header: 'Empresa',
      cell: (c) => <span className="font-medium">{c.name}</span>,
      sortValue: (c) => c.name,
      exportValue: (c) => c.name,
    },
    {
      id: 'cnpj',
      header: 'CNPJ',
      cell: (c) => (
        <span className="text-xs">{c.cnpj ? formatCnpj(c.cnpj) : '—'}</span>
      ),
      exportValue: (c) => (c.cnpj ? formatCnpj(c.cnpj) : ''),
    },
    {
      id: 'phone',
      header: 'Telefone',
      cell: (c) => <span className="text-xs">{c.phone ?? '—'}</span>,
      exportValue: (c) => c.phone ?? '',
      defaultHidden: true,
    },
    {
      id: 'email',
      header: 'E-mail',
      cell: (c) => <span className="text-xs">{c.email ?? '—'}</span>,
      exportValue: (c) => c.email ?? '',
      defaultHidden: true,
    },
    {
      id: 'city',
      header: 'Município',
      cell: (c) => {
        const addr = c.address as Record<string, unknown> | null;
        const cidade = addr?.cidade ? String(addr.cidade) : null;
        const uf = addr?.uf ? String(addr.uf) : null;
        return cidade ? <span>{cidade}{uf ? `/${uf}` : ''}</span> : <span>—</span>;
      },
      exportValue: (c) => {
        const addr = c.address as Record<string, unknown> | null;
        const cidade = addr?.cidade ? String(addr.cidade) : '';
        const uf = addr?.uf ? String(addr.uf) : '';
        return cidade ? `${cidade}${uf ? '/' + uf : ''}` : '';
      },
    },
    {
      id: 'is_active',
      header: 'Situação',
      cell: (c) => <TransportCompanyActiveBadge isActive={c.is_active} />,
      sortValue: (c) => (c.is_active ? 'Ativa' : 'Inativa'),
      exportValue: (c) => (c.is_active ? 'Ativa' : 'Inativa'),
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
