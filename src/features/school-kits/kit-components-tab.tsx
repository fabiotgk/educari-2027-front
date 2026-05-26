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
import { KIT_COMPONENT_CATEGORY_LABELS, type KitComponent } from './types';

/** Aba de relacionamento: componentes vinculados a este kit. */
export function KitComponentsTab({ schoolKitId }: { schoolKitId: string }) {
  const query = useQuery({
    queryKey: ['school-kits', 'kit-components', schoolKitId],
    queryFn: () =>
      listResource<KitComponent>(`school-kits/${schoolKitId}/kit-components`, { limit: 100 }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os componentes deste kit.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum componente vinculado a este kit.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Requer numeração?</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.item_name}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {KIT_COMPONENT_CATEGORY_LABELS[c.category] ?? c.category}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums">{c.quantity}</TableCell>
              <TableCell>
                {c.requires_size ? (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 text-amber-700"
                  >
                    Sim
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Não</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
