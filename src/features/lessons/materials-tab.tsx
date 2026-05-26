'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { listResource } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LessonMaterial } from '@/features/lesson-materials/types';

export function LessonMaterialsTab({ lessonId }: { lessonId: string }) {
  const query = useQuery({
    queryKey: ['lessons', lessonId, 'lesson-materials'],
    queryFn: () => listResource<LessonMaterial>('lesson-materials', { filter: { lesson_id: lessonId }, limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;
  if (query.isError) return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Não foi possível carregar os materiais desta aula.</p>;
  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button asChild><Link href={`/ava/materiais/nova?lesson_id=${lessonId}`}><Plus /> Novo material</Link></Button></div>
      {rows.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhum material vinculado a esta aula.</div> : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40"><TableRow><TableHead>Material</TableHead><TableHead>Tipo</TableHead><TableHead>Tamanho</TableHead><TableHead>Ordem</TableHead></TableRow></TableHeader>
            <TableBody>{rows.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium"><Link href={`/ava/materiais/${m.id}`} className="hover:underline">{m.title}</Link></TableCell>
                <TableCell>{m.file_type ? <Badge variant="secondary">{m.file_type}</Badge> : '—'}</TableCell>
                <TableCell>{m.file_size_kb != null ? `${m.file_size_kb} KB` : '—'}</TableCell>
                <TableCell className="font-mono text-xs">{m.position ?? '—'}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
