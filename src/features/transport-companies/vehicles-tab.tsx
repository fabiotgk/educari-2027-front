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

/** Forma mínima do veículo que esta aba consome (ver VehicleResource). */
interface VehicleRow {
  id: string;
  plate: string | null;
  manufacturer: string | null;
  vehicle_type: string | null;
  capacity: number | null;
  special_seats: number | null;
  ownership: string | null;
  has_gps: boolean | null;
  is_active: boolean | null;
}

const OWNERSHIP_LABEL: Record<string, string> = {
  owned: 'Próprio',
  rented: 'Locado',
  third_party: 'Terceiro',
};

/** Aba de relacionamento: veículos vinculados a esta empresa de transporte. */
export function VehiclesTab({ transportCompanyId }: { transportCompanyId: string }) {
  const query = useQuery({
    queryKey: ['transport-companies', 'vehicles', transportCompanyId],
    queryFn: () =>
      listResource<VehicleRow>('vehicles', {
        filter: { transport_company_id: transportCompanyId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os veículos desta empresa.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum veículo vinculado a esta empresa.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Fabricante</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Capacidade</TableHead>
            <TableHead>Assentos esp.</TableHead>
            <TableHead>Propriedade</TableHead>
            <TableHead>GPS</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="font-mono font-medium">{v.plate ?? '—'}</TableCell>
              <TableCell>{v.manufacturer ?? '—'}</TableCell>
              <TableCell>{v.vehicle_type ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{v.capacity ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{v.special_seats ?? '—'}</TableCell>
              <TableCell>
                {v.ownership ? (OWNERSHIP_LABEL[v.ownership] ?? v.ownership) : '—'}
              </TableCell>
              <TableCell>{v.has_gps ? 'Sim' : 'Não'}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    v.is_active
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                  }
                >
                  {v.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
