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
import { MODALITY_LABELS, STATUS_LABELS, type OpenCourse, type OpenCourseStatus, type OpenCourseModality } from './types';

const STATUS_STYLE: Record<OpenCourseStatus, string> = {
  draft: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  open: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  closed: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

const MODALITY_STYLE: Record<OpenCourseModality, string> = {
  presencial: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
  ead: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  hibrido: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700',
};

export function OpenCourseStatusBadge({ status }: { status: OpenCourseStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function OpenCourseModalityBadge({ modality }: { modality: OpenCourseModality }) {
  return (
    <Badge variant="outline" className={cn(MODALITY_STYLE[modality])}>
      {MODALITY_LABELS[modality]}
    </Badge>
  );
}

interface ColumnActions {
  onView: (c: OpenCourse) => void;
  onEdit: (c: OpenCourse) => void;
  onDelete: (c: OpenCourse) => void;
}

export function buildOpenCourseColumns({ onView, onEdit, onDelete }: ColumnActions): Column<OpenCourse>[] {
  return [
    {
      id: 'title',
      header: 'Título do curso',
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{c.title}</p>
          {c.description && <p className="truncate text-xs text-muted-foreground">{c.description}</p>}
        </div>
      ),
      sortValue: (c) => c.title,
      exportValue: (c) => c.title,
    },
    {
      id: 'modality',
      header: 'Modalidade',
      cell: (c) => <OpenCourseModalityBadge modality={c.modality} />,
      sortValue: (c) => MODALITY_LABELS[c.modality],
      exportValue: (c) => MODALITY_LABELS[c.modality],
    },
    {
      id: 'workload_hours',
      header: 'Carga horária',
      cell: (c) => <span className="tabular-nums">{c.workload_hours}h</span>,
      sortValue: (c) => c.workload_hours,
      exportValue: (c) => String(c.workload_hours),
    },
    {
      id: 'vacancies',
      header: 'Vagas',
      cell: (c) => <span className="tabular-nums">{c.vacancies ?? '—'}</span>,
      sortValue: (c) => c.vacancies ?? 0,
      exportValue: (c) => (c.vacancies != null ? String(c.vacancies) : ''),
    },
    {
      id: 'starts_at',
      header: 'Início',
      cell: (c) => <span>{formatDate(c.starts_at)}</span>,
      sortValue: (c) => c.starts_at,
      exportValue: (c) => formatDate(c.starts_at),
      defaultHidden: true,
    },
    {
      id: 'ends_at',
      header: 'Término',
      cell: (c) => <span>{formatDate(c.ends_at)}</span>,
      sortValue: (c) => c.ends_at,
      exportValue: (c) => formatDate(c.ends_at),
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (c) => <OpenCourseStatusBadge status={c.status} />,
      sortValue: (c) => STATUS_LABELS[c.status],
      exportValue: (c) => STATUS_LABELS[c.status],
    },
    {
      id: 'certificate_enabled',
      header: 'Certificado',
      cell: (c) => <span>{c.certificate_enabled ? 'Sim' : 'Não'}</span>,
      sortValue: (c) => (c.certificate_enabled ? 'Sim' : 'Não'),
      exportValue: (c) => (c.certificate_enabled ? 'Sim' : 'Não'),
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
