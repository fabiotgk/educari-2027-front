'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Topbar } from '@/components/dashboard/topbar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/crud/confirm-dialog';
import { CursorPager } from '@/components/crud/cursor-pager';
import { DataTable } from '@/components/crud/data-table';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { listResource } from '@/lib/api-client';
import { formatPercent } from '@/lib/format';
import { toastError, toastSuccess } from '@/lib/toast';
import { buildCourseEnrollmentColumns } from './columns';
import {
  COURSE_ENROLLMENT_STATUS_LABELS,
  toNumber,
  type CourseEnrollment,
  type StudentSummary,
} from './types';
import { useCourseEnrollments, useDeleteCourseEnrollment, useDeleteCourseEnrollments } from './hooks';

type ConfirmState =
  | { mode: 'single'; enrollment: CourseEnrollment }
  | { mode: 'bulk'; enrollments: CourseEnrollment[] }
  | null;

export function CourseEnrollmentsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [perPage, setPerPage] = React.useState(50);
  const [cursor, setCursor] = React.useState<string | null>(null);
  const [cursorStack, setCursorStack] = React.useState<(string | null)[]>([]);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => {
    setCursor(null);
    setCursorStack([]);
  }, [search, status, perPage]);

  const query = useCourseEnrollments({
    filter: {
      status: status !== 'all' ? status : undefined,
      student_id: search || undefined,
    },
    limit: perPage,
    cursor,
  });
  const rows = query.data?.data ?? [];
  const nextCursor = query.data?.meta.next_cursor ?? null;
  const studentIds = React.useMemo(() => rows.map((e) => e.student_id).filter((id): id is string => Boolean(id)), [rows]);
  const studentsQuery = useQuery({
    queryKey: ['course-enrollments', 'students', studentIds.join(',')],
    queryFn: () => listResource<StudentSummary>('students', { limit: 200 }),
    enabled: studentIds.length > 0,
  });
  const studentNames = React.useMemo(
    () => new Map((studentsQuery.data?.data ?? []).map((student) => [student.id, student.name])),
    [studentsQuery.data?.data],
  );

  const [confirm, setConfirm] = React.useState<ConfirmState>(null);
  const deleteOne = useDeleteCourseEnrollment();
  const deleteMany = useDeleteCourseEnrollments();
  const deleting = deleteOne.isPending || deleteMany.isPending;

  const columns = React.useMemo(
    () =>
      buildCourseEnrollmentColumns({
        studentNames,
        onView: (e) => router.push(`/ava/matriculas/${e.id}`),
        onEdit: (e) => router.push(`/ava/matriculas/${e.id}/editar`),
        onDelete: (e) => setConfirm({ mode: 'single', enrollment: e }),
      }),
    [router, studentNames],
  );

  const averageProgress = rows.length
    ? rows.reduce((sum, e) => sum + (toNumber(e.progress_percent) ?? 0), 0) / rows.length
    : 0;
  const stats: Stat[] = [
    { label: 'Ativas', value: rows.filter((e) => e.status === 'active').length, icon: 'CircleCheck', accent: 'success' },
    { label: 'Concluídas', value: rows.filter((e) => e.status === 'completed').length, icon: 'GraduationCap', accent: 'primary' },
    { label: 'Desistentes', value: rows.filter((e) => e.status === 'dropped').length, icon: 'CircleX', accent: 'warning' },
    { label: 'Média de progresso', value: formatPercent(averageProgress, 0), icon: 'ChartNoAxesColumnIncreasing', accent: 'secondary' },
  ];

  const runDelete = async () => {
    if (!confirm) return;
    try {
      if (confirm.mode === 'single') {
        await deleteOne.mutateAsync(confirm.enrollment.id);
        toastSuccess('Matrícula excluída.');
      } else {
        await deleteMany.mutateAsync(confirm.enrollments.map((e) => e.id));
        toastSuccess(`${confirm.enrollments.length} matrículas excluídas.`);
      }
      setConfirm(null);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'AVA / LMS' }, { label: 'Matrículas' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader title="Matrículas do AVA" description="Hub de acompanhamento das matrículas, progresso e certificados dos cursos." actions={<Button asChild><Link href="/ava/matriculas/nova"><Plus /> Nova matrícula</Link></Button>} />
          <StatCards stats={stats} loading={query.isLoading} />
          {query.isError ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Não foi possível carregar as matrículas.</div> : (
            <DataTable
              columns={columns}
              rows={rows}
              getRowId={(e) => e.id}
              loading={query.isLoading}
              exportFilename="matriculas-ava"
              emptyMessage="Nenhuma matrícula encontrada com os filtros atuais."
              onRowClick={(e) => router.push(`/ava/matriculas/${e.id}`)}
              search={{ value: searchInput, onChange: setSearchInput, placeholder: 'Filtrar por UUID do aluno…' }}
              filters={<Select value={status} onValueChange={setStatus}><SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todas as situações</SelectItem>{Object.entries(COURSE_ENROLLMENT_STATUS_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>}
              bulkActions={(selected, clear) => <Button variant="destructive" size="sm" onClick={() => { setConfirm({ mode: 'bulk', enrollments: selected }); clear(); }}><Trash2 /> Excluir selecionadas</Button>}
              pager={<CursorPager count={rows.length} perPage={perPage} onPerPageChange={setPerPage} loading={query.isFetching} hasPrev={cursorStack.length > 0} hasNext={Boolean(nextCursor)} onPrev={() => setCursorStack((stack) => { const next = [...stack]; const prev = next.pop() ?? null; setCursor(prev); return next; })} onNext={() => { setCursorStack((stack) => [...stack, cursor]); setCursor(nextCursor); }} />}
            />
          )}
        </div>
      </main>
      <ConfirmDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)} destructive loading={deleting} title={confirm?.mode === 'bulk' ? 'Excluir matrículas selecionadas?' : 'Excluir matrícula?'} description={confirm?.mode === 'bulk' ? `${confirm.enrollments.length} matrículas serão excluídas.` : 'A matrícula no AVA será excluída.'} confirmLabel="Excluir" onConfirm={runDelete} />
    </>
  );
}
