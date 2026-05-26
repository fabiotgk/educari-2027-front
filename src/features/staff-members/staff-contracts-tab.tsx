'use client';

import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
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
import { formatDate } from '@/lib/format';

/** Forma mínima do contrato que esta aba consome (ver StaffContractResource). */
interface ContractRow {
  id: string;
  contract_type: string | null;
  workload_hours: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
}

const CONTRACT_STATUS_LABEL: Record<string, string> = {
  active: 'Ativo',
  ended: 'Encerrado',
  cancelled: 'Cancelado',
};

/** Aba de relacionamento: contratos vinculados a este servidor. */
export function StaffContractsTab({ staffMemberId }: { staffMemberId: string }) {
  const query = useQuery({
    queryKey: ['staff-members', 'contracts', staffMemberId],
    queryFn: () =>
      listResource<ContractRow>('staff-contracts', {
        filter: { staff_member_id: staffMemberId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os contratos deste servidor.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum contrato vinculado a este servidor.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Tipo de contrato</TableHead>
            <TableHead>Carga horária (h)</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Término</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.contract_type ?? '—'}</TableCell>
              <TableCell>{c.workload_hours ?? '—'}</TableCell>
              <TableCell className="text-xs">{formatDate(c.start_date)}</TableCell>
              <TableCell className="text-xs">{formatDate(c.end_date)}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {c.status ? (CONTRACT_STATUS_LABEL[c.status] ?? c.status) : '—'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
