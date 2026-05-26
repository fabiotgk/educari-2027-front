'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/format';
import { listResource } from '@/lib/api-client';
import { ASSET_CONDITION_LABELS, type AssetStatus } from '@/features/assets/types';
import { AssetStatusBadge } from '@/features/assets/columns';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AssetCondition = keyof typeof ASSET_CONDITION_LABELS;

interface SchoolAssetRow {
  id: string;
  patrimony_number: string;
  name: string;
  condition: AssetCondition | null;
  status: AssetStatus | null;
  school_id: string | null;
  category: { id: string; name: string } | null;
  acquisition_value: string | null;
  current_value: string | null;
}

/** Aba de relacionamento: patrimônio da escola. */
export function SchoolAssetsTab({ schoolId }: { schoolId: string }) {
  const query = useQuery({
    queryKey: ['schools', 'assets', schoolId],
    queryFn: () =>
      listResource<SchoolAssetRow>('assets', {
        filter: { school_id: schoolId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os bens desta escola.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum bem patrimonial vinculado a esta escola.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Patrimônio</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Valor de aquisição</TableHead>
            <TableHead>Valor atual</TableHead>
            <TableHead>Acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>
                <Link
                  href={`/patrimonio/${asset.id}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {asset.patrimony_number}
                </Link>
                <div className="mt-0.5 text-sm text-muted-foreground">{asset.name}</div>
              </TableCell>
              <TableCell>{asset.category?.name ?? '—'}</TableCell>
              <TableCell>{asset.condition ? ASSET_CONDITION_LABELS[asset.condition] : '—'}</TableCell>
              <TableCell>
                {asset.status ? <AssetStatusBadge status={asset.status} /> : <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                {asset.acquisition_value != null ? formatCurrency(Number(asset.acquisition_value)) : '—'}
              </TableCell>
              <TableCell>
                {asset.current_value != null ? formatCurrency(Number(asset.current_value)) : '—'}
              </TableCell>
              <TableCell>
                <Link
                  href={`/patrimonio/${asset.id}`}
                  className="text-xs text-primary underline-offset-2 hover:underline"
                >
                  Ver detalhes
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
