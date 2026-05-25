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
import {
  GENDER_LABELS,
  STUDENT_STATUS_LABELS,
  type Student,
  type StudentStatus,
} from './types';

const STATUS_STYLE: Record<StudentStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  anonymized: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_STYLE[status])}>
      {STUDENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function StudentGenderBadge({ gender }: { gender: string | null }) {
  if (!gender) return <span className="text-muted-foreground">—</span>;
  return (
    <Badge variant="secondary">
      {GENDER_LABELS[gender as keyof typeof GENDER_LABELS] ?? gender}
    </Badge>
  );
}

interface ColumnActions {
  onView: (s: Student) => void;
  onEdit: (s: Student) => void;
  onDelete: (s: Student) => void;
}

export function buildStudentColumns({ onView, onEdit, onDelete }: ColumnActions): Column<Student>[] {
  return [
    {
      id: 'registration_number',
      header: 'Matrícula',
      cell: (s) => <span className="font-mono text-xs">{s.registration_number ?? '—'}</span>,
      sortValue: (s) => s.registration_number,
      exportValue: (s) => s.registration_number,
    },
    {
      id: 'full_name',
      header: 'Aluno',
      cell: (s) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{s.full_name}</p>
          {s.social_name && <p className="truncate text-xs text-muted-foreground">{s.social_name}</p>}
        </div>
      ),
      sortValue: (s) => s.full_name,
      exportValue: (s) => s.full_name,
    },
    {
      id: 'cpf',
      header: 'CPF',
      cell: (s) => <span className="text-xs">{s.cpf ? formatCpf(s.cpf) : '—'}</span>,
      exportValue: (s) => (s.cpf ? formatCpf(s.cpf) : ''),
    },
    {
      id: 'birth_date',
      header: 'Nascimento',
      cell: (s) => <span>{formatDate(s.birth_date)}</span>,
      sortValue: (s) => s.birth_date,
      exportValue: (s) => formatDate(s.birth_date),
    },
    {
      id: 'gender',
      header: 'Gênero',
      cell: (s) => <StudentGenderBadge gender={s.gender} />,
      sortValue: (s) => (s.gender ? GENDER_LABELS[s.gender] : ''),
      exportValue: (s) => (s.gender ? GENDER_LABELS[s.gender] : ''),
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (s) => <StudentStatusBadge status={s.anonymized_at ? 'anonymized' : 'active'} />,
      sortValue: (s) => (s.anonymized_at ? STUDENT_STATUS_LABELS.anonymized : STUDENT_STATUS_LABELS.active),
      exportValue: (s) => (s.anonymized_at ? STUDENT_STATUS_LABELS.anonymized : STUDENT_STATUS_LABELS.active),
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
