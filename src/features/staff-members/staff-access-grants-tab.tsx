'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { formatDate } from '@/lib/format';
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

interface AccessGrantRow {
  id: string;
  role: string;
  scope_type: string | null;
  scope_id: string | null;
  granted_by_user_id: string | null;
  starts_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

function isActiveGrant(grant: AccessGrantRow): boolean {
  if (grant.revoked_at) return false;

  const now = Date.now();
  const startsAt = grant.starts_at ? new Date(grant.starts_at).getTime() : Number.NEGATIVE_INFINITY;
  const expiresAt = grant.expires_at ? new Date(grant.expires_at).getTime() : Number.POSITIVE_INFINITY;

  if (Number.isNaN(startsAt) || Number.isNaN(expiresAt)) return false;

  return startsAt <= now && now <= expiresAt;
}

/** Aba de relacionamento: concessões de acesso vinculadas ao usuário do servidor. */
export function StaffAccessGrantsTab({ staffUserId }: { staffUserId: string | null }) {
  if (!staffUserId) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Este servidor não possui usuário vinculado para consultar concessões de acesso.
      </div>
    );
  }

  const query = useQuery({
    queryKey: ['staff-members', 'access-grants', staffUserId],
    queryFn: () =>
      listResource<AccessGrantRow>('access-grants', {
        filter: { user_id: staffUserId },
        limit: 100,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar as concessões de acesso deste servidor.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhuma concessão de acesso vinculada a este servidor.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Papel</TableHead>
            <TableHead>Escopo</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead>Concedente</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>Acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((grant) => {
            const isActive = isActiveGrant(grant);
            return (
              <TableRow key={grant.id}>
                <TableCell className="font-medium">{grant.role}</TableCell>
                <TableCell className="font-mono text-xs">
                  {grant.scope_type ?? 'global'}
                  {grant.scope_id ? ` · ${grant.scope_id}` : ''}
                </TableCell>
                <TableCell>
                  <Badge variant={isActive ? 'secondary' : 'destructive'}>
                    {isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{grant.granted_by_user_id ?? '—'}</TableCell>
                <TableCell>{formatDate(grant.starts_at)}</TableCell>
                <TableCell>{formatDate(grant.expires_at)}</TableCell>
                <TableCell>
                  <Link
                    href={`/auditoria/${grant.id}`}
                    className="text-xs text-primary underline-offset-2 hover:underline"
                  >
                    Ver detalhe
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
