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
import { lessonPlanApprovalLabel, lessonPlanApprovalVariant, type LessonPlan } from '@/features/lesson-plans/types';

export function LessonPlansTab({ diaryId }: { diaryId: string }) {
  const query = useQuery({
    queryKey: ['class-diaries', diaryId, 'lesson-plans'],
    queryFn: () =>
      listResource<LessonPlan>('lesson-plans', {
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
        Não foi possível carregar os planos deste diário.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button asChild>
          <Link href={`/diario/planos/nova?class_diary_id=${diaryId}`}>
            <Plus /> Novo plano
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum plano associado a este diário.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Planejadas</TableHead>
                <TableHead>Ministradas</TableHead>
                <TableHead>Última atualização</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    <Link href={`/diario/planos/${plan.id}`} className="hover:underline">
                      {plan.evaluation_period_id}
                    </Link>
                  </TableCell>
                  <TableCell>{plan.planned_lessons}</TableCell>
                  <TableCell>{plan.taught_lessons ?? 0}</TableCell>
                  <TableCell>{formatDate(plan.updated_at)}</TableCell>
                  <TableCell>
                    <Badge variant={lessonPlanApprovalVariant(plan.approval_status)}>
                      {lessonPlanApprovalLabel(plan.approval_status)}
                    </Badge>
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
