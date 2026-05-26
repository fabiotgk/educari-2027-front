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
import { formatCpf, formatDate } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import { STAFF_STATUS_LABELS, type StaffMember } from './types';

const STATUS_STYLE: Record<string, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  inactive: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
  retired: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  leave: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  dismissed: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function StaffMemberStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge
      variant="outline"
      className={cn(STATUS_STYLE[status] ?? 'border-muted bg-muted text-muted-foreground')}
    >
      {STAFF_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

interface ColumnActions {
  onView: (s: StaffMember) => void;
  onEdit: (s: StaffMember) => void;
  onDelete: (s: StaffMember) => void;
}

export function buildStaffMemberColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<StaffMember>[] {
  return [
    {
      id: 'registration_number',
      header: 'Matrícula',
      cell: (s) => (
        <span className="font-mono text-xs">{s.registration_number ?? '—'}</span>
      ),
      sortValue: (s) => s.registration_number,
      exportValue: (s) => s.registration_number ?? '',
    },
    {
      id: 'name',
      header: 'Nome',
      cell: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{s.name}</p>
          {s.role_title && (
            <p className="truncate text-xs text-muted-foreground">{s.role_title}</p>
          )}
        </div>
      ),
      sortValue: (s) => s.name,
      exportValue: (s) => s.name,
    },
    {
      id: 'cpf',
      header: 'CPF',
      cell: (s) => (
        <span className="text-xs">{s.cpf ? formatCpf(s.cpf) : '—'}</span>
      ),
      exportValue: (s) => (s.cpf ? formatCpf(s.cpf) : ''),
      defaultHidden: true,
    },
    {
      id: 'role_title',
      header: 'Cargo / função',
      cell: (s) => <span>{s.role_title ?? '—'}</span>,
      sortValue: (s) => s.role_title,
      exportValue: (s) => s.role_title ?? '',
      defaultHidden: true,
    },
    {
      id: 'admission_date',
      header: 'Admissão',
      cell: (s) => (
        <span className="text-xs">{formatDate(s.admission_date)}</span>
      ),
      sortValue: (s) => s.admission_date,
      exportValue: (s) => formatDate(s.admission_date),
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (s) => <StaffMemberStatusBadge status={s.status} />,
      sortValue: (s) => (s.status ? (STAFF_STATUS_LABELS[s.status] ?? s.status) : ''),
      exportValue: (s) => (s.status ? (STAFF_STATUS_LABELS[s.status] ?? s.status) : ''),
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
