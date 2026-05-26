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
import { formatDateTime } from '@/lib/format';
import { toNumber, type Certificate } from './types';

interface ColumnActions {
  onView: (row: Certificate) => void;
  onEdit: (row: Certificate) => void;
  onDelete: (row: Certificate) => void;
}

export function buildCertificateColumns({ onView, onEdit, onDelete }: ColumnActions): Column<Certificate>[] {
  return [
    {
      id: 'certificate_code',
      header: 'Código',
      cell: (c) => <span className="font-mono text-xs font-medium">{c.certificate_code}</span>,
      sortValue: (c) => c.certificate_code,
      exportValue: (c) => c.certificate_code,
    },
    {
      id: 'course_enrollment_id',
      header: 'Matrícula',
      cell: (c) => <span className="font-mono text-xs">{c.course_enrollment_id}</span>,
      sortValue: (c) => c.course_enrollment_id,
      exportValue: (c) => c.course_enrollment_id,
    },
    {
      id: 'issued_at',
      header: 'Emissão',
      cell: (c) => formatDateTime(c.issued_at),
      sortValue: (c) => c.issued_at,
      exportValue: (c) => formatDateTime(c.issued_at),
    },
    {
      id: 'workload_hours',
      header: 'Carga horária',
      cell: (c) => (c.workload_hours != null ? `${c.workload_hours} h` : '—'),
      sortValue: (c) => toNumber(c.workload_hours),
      exportValue: (c) => c.workload_hours,
    },
    {
      id: 'verification_url',
      header: 'Verificação',
      cell: (c) => c.verification_url ?? '—',
      exportValue: (c) => c.verification_url,
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (c) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
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
