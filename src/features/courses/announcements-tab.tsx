'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { listResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime } from '@/lib/format';
import type { CourseAnnouncement } from '@/features/course-announcements/types';

export function CourseAnnouncementsTab({ courseId }: { courseId: string }) {
  const query = useQuery({
    queryKey: ['courses', courseId, 'course-announcements'],
    queryFn: () => listResource<CourseAnnouncement>('course-announcements', { filter: { course_id: courseId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar os avisos deste curso.</p>;
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button asChild><Link href={`/ava/avisos/nova?course_id=${courseId}`}><Plus /> Novo aviso</Link></Button></div>
      {rows.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhum aviso vinculado a este curso.</div> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40"><TableRow><TableHead>Aviso</TableHead><TableHead>Publicação</TableHead><TableHead>Fixado</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium"><Link href={`/ava/avisos/${a.id}`} className="hover:underline">{a.title}</Link></TableCell>
                <TableCell>{formatDateTime(a.published_at)}</TableCell>
                <TableCell><Badge variant={a.is_pinned ? 'default' : 'secondary'}>{a.is_pinned ? 'Sim' : 'Não'}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
