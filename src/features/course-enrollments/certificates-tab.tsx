'use client';

import Link from 'next/link';
import { ExternalLink, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import type { Certificate } from '@/features/certificates/types';

export function CourseEnrollmentCertificatesTab({ courseEnrollmentId }: { courseEnrollmentId: string }) {
  const query = useQuery({
    queryKey: ['course-enrollments', courseEnrollmentId, 'certificates'],
    queryFn: () =>
      listResource<Certificate>('certificates', {
        filter: { course_enrollment_id: courseEnrollmentId },
        limit: 20,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar o certificado desta matrícula.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/ava/certificados/novo?course_enrollment_id=${courseEnrollmentId}`}>
            <Plus /> Novo certificado
          </Link>
        </Button>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum certificado emitido para esta matrícula.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Carga horária</TableHead>
                <TableHead>Verificação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/ava/certificados/${c.id}`} className="font-mono text-xs font-medium underline-offset-4 hover:underline">
                      {c.certificate_code}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDateTime(c.issued_at)}</TableCell>
                  <TableCell>{c.workload_hours != null ? `${c.workload_hours} h` : '—'}</TableCell>
                  <TableCell>
                    {c.verification_url ? (
                      <a href={c.verification_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline">
                        Abrir <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
