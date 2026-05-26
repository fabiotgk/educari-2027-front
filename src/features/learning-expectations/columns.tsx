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
import type { LearningExpectation } from './types';
import { learningExpectationActiveLabel } from './types';

interface ColumnActions {
  onView: (expectation: LearningExpectation) => void;
  onEdit: (expectation: LearningExpectation) => void;
  onDelete: (expectation: LearningExpectation) => void;
}

export function buildLearningExpectationColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<LearningExpectation>[] {
  return [
    {
      id: 'bncc_code',
      header: 'Código BNCC',
      cell: (expectation) => <span className="font-mono text-xs font-semibold">{expectation.bncc_code}</span>,
      sortValue: (expectation) => expectation.bncc_code,
      exportValue: (expectation) => expectation.bncc_code,
    },
    {
      id: 'school_grade',
      header: 'Série',
      cell: (expectation) => expectation.school_grade_id,
      sortValue: (expectation) => expectation.school_grade_id,
      exportValue: (expectation) => expectation.school_grade_id,
      defaultHidden: true,
    },
    {
      id: 'subject',
      header: 'Componente',
      cell: (expectation) => expectation.subject_id,
      sortValue: (expectation) => expectation.subject_id,
      exportValue: (expectation) => expectation.subject_id,
      defaultHidden: true,
    },
    {
      id: 'description',
      header: 'Descrição',
      cell: (expectation) => <span className="max-w-[380px] block truncate">{expectation.description}</span>,
      sortValue: (expectation) => expectation.description,
      exportValue: (expectation) => expectation.description,
    },
    {
      id: 'status',
      header: 'Situação',
      cell: (expectation) => (
        <Badge variant={expectation.is_active ? 'default' : 'secondary'}>
          {learningExpectationActiveLabel(expectation.is_active)}
        </Badge>
      ),
      sortValue: (expectation) => learningExpectationActiveLabel(expectation.is_active),
      exportValue: (expectation) => learningExpectationActiveLabel(expectation.is_active),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (expectation) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(expectation)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(expectation)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(expectation)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}

