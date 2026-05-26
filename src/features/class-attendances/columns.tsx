import { Eye } from 'lucide-react';

import { formatPercent, formatNumber } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import type { Column } from '@/components/crud/data-table';
import type { ClassAttendance } from './types';

function attendanceBadge(value: number | null): React.ReactNode {
  if (value === null) return <Badge variant="secondary">—</Badge>;
  if (value >= 85) return <Badge>Alta</Badge>;
  if (value >= 60) return <Badge variant="outline">Média</Badge>;
  return <Badge variant="destructive">Baixa</Badge>;
}

export function buildClassAttendanceColumns({ onView }: { onView: (item: ClassAttendance) => void }): Column<ClassAttendance>[] {
  return [
    {
      id: 'lesson_date',
      header: 'Data',
      cell: (item) => item.lesson_date ?? '—',
      sortValue: (item) => item.lesson_date ?? '',
      exportValue: (item) => item.lesson_date ?? '',
    },
    {
      id: 'class_id',
      header: 'Turma',
      cell: (item) => <span className="font-mono text-xs">{item.class_id}</span>,
      sortValue: (item) => item.class_id,
      exportValue: (item) => item.class_id,
    },
    {
      id: 'present_count',
      header: 'Presentes',
      cell: (item) => <span className="tabular-nums">{formatNumber(item.present_count ?? 0)}</span>,
      sortValue: (item) => item.present_count ?? 0,
      exportValue: (item) => item.present_count ?? 0,
    },
    {
      id: 'absent_count',
      header: 'Ausentes',
      cell: (item) => <span className="tabular-nums">{formatNumber(item.absent_count ?? 0)}</span>,
      sortValue: (item) => item.absent_count ?? 0,
      exportValue: (item) => item.absent_count ?? 0,
    },
    {
      id: 'total_enrolled',
      header: 'Total matriculados',
      cell: (item) => <span className="tabular-nums">{formatNumber(item.total_enrolled ?? 0)}</span>,
      sortValue: (item) => item.total_enrolled ?? 0,
      exportValue: (item) => item.total_enrolled ?? 0,
      defaultHidden: true,
    },
    {
      id: 'attendance_pct',
      header: 'Frequência',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span>{item.attendance_pct != null ? formatPercent(item.attendance_pct, 1) : '—'}</span>
          {attendanceBadge(item.attendance_pct)}
        </div>
      ),
      sortValue: (item) => item.attendance_pct ?? 0,
      exportValue: (item) => item.attendance_pct,
      defaultHidden: true,
    },
    {
      id: 'view',
      header: '',
      pinned: true,
      className: 'w-10 text-right',
      cell: (item) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onView(item);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-sm transition-colors hover:bg-muted"
          aria-label="Ver detalhe"
        >
          <Eye />
        </button>
      ),
    },
  ];
}
