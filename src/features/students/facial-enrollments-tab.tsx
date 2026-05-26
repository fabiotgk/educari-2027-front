'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FacialEnrollmentRow {
  id: string;
  status: string;
  consent_given: boolean;
  consent_at: string | null;
  enrolled_at: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  revoked: 'Revogado',
};

export function StudentFacialEnrollmentsTab({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: ['students', 'facial-enrollments', studentId],
    queryFn: () =>
      listResource<FacialEnrollmentRow>('facial-enrollments', {
        filter: { student_id: studentId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os dados faciais deste aluno.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum registro facial vinculado a este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Consentimento</TableHead>
            <TableHead>Data do consentimento</TableHead>
            <TableHead>Data de cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Badge variant="secondary">{STATUS_LABEL[row.status] ?? row.status}</Badge>
              </TableCell>
              <TableCell>{row.consent_given ? 'Sim' : 'Não'}</TableCell>
              <TableCell>{formatDate(row.consent_at)}</TableCell>
              <TableCell>
                <Link href={`/facial/${row.id}`} className="text-primary underline-offset-2 hover:underline">
                  {formatDate(row.enrolled_at)}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
