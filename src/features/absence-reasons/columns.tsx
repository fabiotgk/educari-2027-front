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
import type { AbsenceReason } from './types';

interface ColumnActions {
  onView: (reason: AbsenceReason) => void;
  onEdit: (reason: AbsenceReason) => void;
  onDelete: (reason: AbsenceReason) => void;
}

function boolBadge(value: boolean, positiveLabel: string, negativeLabel: string) {
  return <Badge variant={value ? 'default' : 'secondary'}>{value ? positiveLabel : negativeLabel}</Badge>;
}

export function buildAbsenceReasonColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<AbsenceReason>[] {
  return [
    {
      id: 'code',
      header: 'Código',
      cell: (reason) => <span className="font-mono text-xs">{reason.code}</span>,
      sortValue: (reason) => reason.code,
      exportValue: (reason) => reason.code,
    },
    {
      id: 'name',
      header: 'Nome',
      cell: (reason) => reason.name,
      sortValue: (reason) => reason.name,
      exportValue: (reason) => reason.name,
    },
    {
      id: 'is_justified',
      header: 'Justificada',
      cell: (reason) => boolBadge(reason.is_justified, 'Sim', 'Não'),
      sortValue: (reason) => (reason.is_justified ? 1 : 0),
      exportValue: (reason) => (reason.is_justified ? 'Sim' : 'Não'),
      defaultHidden: true,
    },
    {
      id: 'requires_document',
      header: 'Documento',
      cell: (reason) => boolBadge(reason.requires_document, 'Exige', 'Não exige'),
      sortValue: (reason) => (reason.requires_document ? 1 : 0),
      exportValue: (reason) => (reason.requires_document ? 'Sim' : 'Não'),
      defaultHidden: true,
    },
    {
      id: 'is_active',
      header: 'Situação',
      cell: (reason) => boolBadge(reason.is_active, 'Ativo', 'Inativo'),
      sortValue: (reason) => (reason.is_active ? 1 : 0),
      exportValue: (reason) => (reason.is_active ? 'Ativo' : 'Inativo'),
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (reason) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(reason)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(reason)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(reason)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
