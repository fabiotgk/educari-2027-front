'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { listResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PublishedBadge } from '@/features/course-modules/columns';
import type { CourseModule } from '@/features/course-modules/types';

export function CourseModulesTab({ courseId }: { courseId: string }) {
  const query = useQuery({
    queryKey: ['courses', courseId, 'course-modules'],
    queryFn: () => listResource<CourseModule>('course-modules', { filter: { course_id: courseId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar os módulos deste curso.</p>;
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button asChild><Link href={`/ava/modulos/nova?course_id=${courseId}`}><Plus /> Novo módulo</Link></Button>
      </div>
      {rows.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhum módulo vinculado a este curso.</div> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40"><TableRow><TableHead>Módulo</TableHead><TableHead>Ordem</TableHead><TableHead>Publicação</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium"><Link href={`/ava/modulos/${m.id}`} className="hover:underline">{m.title}</Link></TableCell>
                <TableCell className="font-mono text-xs">{m.position ?? '—'}</TableCell>
                <TableCell><PublishedBadge published={m.is_published} /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
