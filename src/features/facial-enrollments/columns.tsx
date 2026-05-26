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
import { formatDate } from '@/lib/format';
import type { Column } from '@/components/crud/data-table';
import {
  FACIAL_ENROLLMENT_STATUS_LABELS,
  type FacialEnrollment,
  type FacialEnrollmentStatus,
} from './types';

const STATUS_STYLE: Record<FacialEnrollmentStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  revoked: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

export function FacialEnrollmentStatusBadge({
  status,
}: {
  status: FacialEnrollmentStatus;
}) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {FACIAL_ENROLLMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (f: FacialEnrollment) => void;
  onEdit: (f: FacialEnrollment) => void;
  onDelete: (f: FacialEnrollment) => void;
}

export function buildFacialEnrollmentColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<FacialEnrollment>[] {
  return [
    {
      id: 'student',
      header: 'Aluno',
      cell: (f) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {f.student?.full_name ?? '—'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {f.student_id}
          </p>
        </div>
      ),
      sortValue: (f) => f.student?.full_name ?? f.student_id,
      exportValue: (f) => f.student?.full_name ?? f.student_id,
    },
    {
      id: 'photo_reference',
      header: 'Referência da foto',
      cell: (f) => (
        <span className="font-mono text-xs">{f.photo_reference}</span>
      ),
      sortValue: (f) => f.photo_reference,
      exportValue: (f) => f.photo_reference,
    },
    {
      id: 'template_hash',
      header: 'Hash do template',
      cell: (f) => (
        <span className="font-mono text-xs">
          {f.template_hash ?? '—'}
        </span>
      ),
      sortValue: (f) => f.template_hash,
      exportValue: (f) => f.template_hash ?? '',
      defaultHidden: true,
    },
    {
      id: 'consent_given',
      header: 'Consentimento',
      cell: (f) => (
        <Badge variant={f.consent_given ? 'default' : 'secondary'}>
          {f.consent_given ? 'Concedido' : 'Não concedido'}
        </Badge>
      ),
      sortValue: (f) => (f.consent_given ? 1 : 0),
      exportValue: (f) => (f.consent_given ? 'Sim' : 'Não'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (f) => <FacialEnrollmentStatusBadge status={f.status} />,
      sortValue: (f) => FACIAL_ENROLLMENT_STATUS_LABELS[f.status],
      exportValue: (f) => FACIAL_ENROLLMENT_STATUS_LABELS[f.status],
    },
    {
      id: 'enrolled_at',
      header: 'Data do cadastro',
      cell: (f) => <span>{formatDate(f.enrolled_at)}</span>,
      sortValue: (f) => f.enrolled_at,
      exportValue: (f) => formatDate(f.enrolled_at),
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (f) => (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex justify-end"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Ações"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(f)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(f)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(f)}
              >
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
