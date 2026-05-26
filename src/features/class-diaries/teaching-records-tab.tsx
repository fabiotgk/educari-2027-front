'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { listResource } from '@/lib/api-client';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type TeachingRecord } from '@/features/teaching-records/types';

export function TeachingRecordsTab({ diaryId }: { diaryId: string }) {
  const query = useQuery({
    queryKey: ['class-diaries', diaryId, 'teaching-records'],
    queryFn: () =>
      listResource<TeachingRecord>('teaching-records', {
        filter: { class_diary_id: diaryId },
        limit: 100,
      }),
  });

  if (query.isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os registros deste diário.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/diario/registros/nova?class_diary_id=${diaryId}`}>
            <Plus /> Novo registro
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum registro associado a este diário.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Aula do dia</TableHead>
                <TableHead>Registrado por</TableHead>
                <TableHead>Substituição</TableHead>
                <TableHead>Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <Link href={`/diario/registros/${record.id}`} className="hover:underline">
                      {formatDate(record.lesson_date)}
                    </Link>
                  </TableCell>
                  <TableCell>{record.lesson_number_in_day}</TableCell>
                  <TableCell>{record.recorded_by_user_id}</TableCell>
                  <TableCell>{record.is_substituted ? <Badge variant="secondary">Sim</Badge> : 'Não'}</TableCell>
                  <TableCell>{formatDate(record.updated_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
