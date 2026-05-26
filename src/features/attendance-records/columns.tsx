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
import { formatDate } from '@/lib/format';
import { ATTENDANCE_RECORDED_VIA_LABELS, ATTENDANCE_STATUS_LABELS, type AttendanceRecord } from './types';

interface ColumnActions {
  onView: (record: AttendanceRecord) => void;
  onEdit: (record: AttendanceRecord) => void;
  onDelete: (record: AttendanceRecord) => void;
}

const STATUS_STYLES: Record<keyof typeof ATTENDANCE_STATUS_LABELS, string> = {
  present: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  late: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  absent: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  justified: 'border-violet-500/30 bg-violet-500/10 text-violet-700',
  not_required: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
};

export function AttendanceStatusBadge({ status }: { status: AttendanceRecord['status'] }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {ATTENDANCE_STATUS_LABELS[status]}
    </Badge>
  );
}

export function buildAttendanceRecordColumns({
  onView,
  onEdit,
  onDelete,
}: ColumnActions): Column<AttendanceRecord>[] {
  return [
    {
      id: 'lesson_date',
      header: 'Data',
      cell: (record) => formatDate(record.lesson_date, "dd/MM/yyyy"),
      sortValue: (record) => record.lesson_date,
      exportValue: (record) => record.lesson_date,
    },
    {
      id: 'enrollment_id',
      header: 'Matrícula',
      cell: (record) => <span className="font-mono text-xs">{record.enrollment_id}</span>,
      sortValue: (record) => record.enrollment_id,
      exportValue: (record) => record.enrollment_id,
    },
    {
      id: 'class_diary_id',
      header: 'Diário',
      cell: (record) => (record.class_diary_id ? <span className="font-mono text-xs">{record.class_diary_id}</span> : '—'),
      sortValue: (record) => record.class_diary_id,
      exportValue: (record) => record.class_diary_id,
      defaultHidden: true,
    },
    {
      id: 'lesson_number',
      header: 'Aula',
      cell: (record) => (record.lesson_number_in_day ?? '—'),
      sortValue: (record) => record.lesson_number_in_day ?? undefined,
      exportValue: (record) => record.lesson_number_in_day,
      defaultHidden: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (record) => <AttendanceStatusBadge status={record.status} />,
      sortValue: (record) => ATTENDANCE_STATUS_LABELS[record.status],
      exportValue: (record) => ATTENDANCE_STATUS_LABELS[record.status],
      defaultHidden: true,
    },
    {
      id: 'absence_reason',
      header: 'Motivo',
      cell: (record) => <span className="text-sm text-muted-foreground">{record.absence_reason_id ?? '—'}</span>,
      sortValue: (record) => record.absence_reason_id ?? '',
      exportValue: (record) => record.absence_reason_id,
      defaultHidden: true,
    },
    {
      id: 'recorded_via',
      header: 'Canal',
      cell: (record) =>
        record.recorded_via ? ATTENDANCE_RECORDED_VIA_LABELS[record.recorded_via] : '—',
      sortValue: (record) => (record.recorded_via ? ATTENDANCE_RECORDED_VIA_LABELS[record.recorded_via] : ''),
      exportValue: (record) => (record.recorded_via ? ATTENDANCE_RECORDED_VIA_LABELS[record.recorded_via] : ''),
    },
    {
      id: 'observacoes',
      header: 'Observação',
      cell: (record) => <span className="max-w-[260px] truncate">{record.notes ?? '—'}</span>,
      sortValue: (record) => record.notes ?? '',
      exportValue: (record) => record.notes ?? '',
      defaultHidden: true,
    },
    {
      id: 'actions',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (record) => (
        <div onClick={(event) => event.stopPropagation()} className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Ações">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(record)}>
                <Eye /> Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(record)}>
                <Pencil /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(record)}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];
}
