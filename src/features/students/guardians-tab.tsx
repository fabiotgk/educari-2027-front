'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { listResource } from '@/lib/api-client';
import { maskPhone } from '@/lib/masks';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StudentGuardianRow {
  id: string;
  full_name: string;
  relationship?: string | null;
  email: string | null;
  phone_primary: string | null;
  whatsapp: string | null;
}

export function StudentGuardiansTab({ studentId }: { studentId: string }) {
  const query = useQuery({
    queryKey: ['students', 'guardians', studentId],
    queryFn: () =>
      listResource<StudentGuardianRow>('guardians', {
        filter: { student_id: studentId },
        limit: 200,
      }),
  });

  if (query.isLoading) return <Skeleton className="h-48 w-full rounded-xl" />;

  if (query.isError) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Não foi possível carregar os responsáveis deste aluno.
      </p>
    );
  }

  const rows = query.data?.data ?? [];

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        Nenhum responsável vinculado a este aluno.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Relacionamento</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Contato</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Link href={`/responsaveis/${row.id}`} className="text-primary underline-offset-2 hover:underline">
                  {row.full_name}
                </Link>
              </TableCell>
              <TableCell>{row.relationship ?? '—'}</TableCell>
              <TableCell>{row.email ?? '—'}</TableCell>
              <TableCell>
                {row.phone_primary ? maskPhone(row.phone_primary) : '—'}
                {row.whatsapp ? ` / ${maskPhone(row.whatsapp)} (WhatsApp)` : ''}
              </TableCell>
              <TableCell>
                <Link href={`/responsaveis/${row.id}`} className="text-xs text-primary underline-offset-2 hover:underline">
                  Ver responsável
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
