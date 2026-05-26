'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { listResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LESSON_CONTENT_TYPE_LABELS, type Lesson } from '@/features/lessons/types';

export function CourseModuleLessonsTab({ moduleId }: { moduleId: string }) {
  const query = useQuery({
    queryKey: ['course-modules', moduleId, 'lessons'],
    queryFn: () => listResource<Lesson>('lessons', { filter: { course_module_id: moduleId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar as aulas deste módulo.</p>;
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button asChild><Link href={`/ava/aulas/nova?course_module_id=${moduleId}`}><Plus /> Nova aula</Link></Button></div>
      {rows.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhuma aula vinculada a este módulo.</div> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40"><TableRow><TableHead>Aula</TableHead><TableHead>Ordem</TableHead><TableHead>Tipo</TableHead><TableHead>Publicação</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium"><Link href={`/ava/aulas/${l.id}`} className="hover:underline">{l.title}</Link></TableCell>
                <TableCell className="font-mono text-xs">{l.position ?? '—'}</TableCell>
                <TableCell>{l.content_type ? LESSON_CONTENT_TYPE_LABELS[l.content_type] : '—'}</TableCell>
                <TableCell><Badge variant={l.is_published ? 'default' : 'secondary'}>{l.is_published ? 'Publicada' : 'Rascunho'}</Badge></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
