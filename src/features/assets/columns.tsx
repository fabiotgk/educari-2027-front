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
import { formatCurrency } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  ASSET_CONDITION_LABELS,
  ASSET_STATUS_LABELS,
  type Asset,
  type AssetCondition,
  type AssetStatus,
} from './types';

const STATUS_STYLE: Record<AssetStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  maintenance: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  disposed: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-700',
  lost: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

const CONDITION_STYLE: Record<AssetCondition, string> = {
  new: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  good: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  fair: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  poor: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {ASSET_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (a: Asset) => void;
  onEdit: (a: Asset) => void;
  onDelete: (a: Asset) => void;
}

export function buildAssetColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<Asset>[] {
  return [
    {
      id: 'patrimony_number',
      header: 'Tombamento',
      cell: (a) => (
        <span className="font-mono text-xs">{a.patrimony_number}</span>
      ),
      sortValue: (a) => a.patrimony_number,
      exportValue: (a) => a.patrimony_number,
    },
    {
      id: 'name',
      header: 'Bem',
      cell: (a) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{a.name}</p>
          {a.category && (
            <p className="truncate text-xs text-muted-foreground">{a.category.name}</p>
          )}
        </div>
      ),
      sortValue: (a) => a.name,
      exportValue: (a) => a.name,
    },
    {
      id: 'condition',
      header: 'Estado',
      cell: (a) =>
        a.condition ? (
          <Badge variant="outline" className={cn(CONDITION_STYLE[a.condition])}>
            {ASSET_CONDITION_LABELS[a.condition]}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      sortValue: (a) => (a.condition ? ASSET_CONDITION_LABELS[a.condition] : ''),
      exportValue: (a) => (a.condition ? ASSET_CONDITION_LABELS[a.condition] : ''),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (a) =>
        a.status ? <AssetStatusBadge status={a.status} /> : <span className="text-muted-foreground">—</span>,
      sortValue: (a) => (a.status ? ASSET_STATUS_LABELS[a.status] : ''),
      exportValue: (a) => (a.status ? ASSET_STATUS_LABELS[a.status] : ''),
    },
    {
      id: 'location',
      header: 'Localização',
      cell: (a) => <span className="text-sm">{a.location ?? '—'}</span>,
      sortValue: (a) => a.location,
      exportValue: (a) => a.location ?? '',
    },
    {
      id: 'acquisition_value',
      header: 'Valor aquisição',
      cell: (a) => (
        <span className="tabular-nums text-sm">
          {a.acquisition_value ? formatCurrency(Number(a.acquisition_value)) : '—'}
        </span>
      ),
      exportValue: (a) => a.acquisition_value ?? '',
      defaultHidden: true,
    },
    {
      id: 'current_value',
      header: 'Valor atual',
      cell: (a) => (
        <span className="tabular-nums text-sm">
          {a.current_value ? formatCurrency(Number(a.current_value)) : '—'}
        </span>
      ),
      exportValue: (a) => a.current_value ?? '',
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (a) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(a)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(a)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(a)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
