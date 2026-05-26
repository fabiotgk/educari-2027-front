'use client';

import Link from 'next/link';
import { BookOpenCheck, CalendarCheck, Megaphone, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalAuth } from '@/lib/providers/portal-auth-provider';

export function PortalDashboardPage() {
  const { account, students, token } = usePortalAuth();

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <section>
        <p className="text-muted-foreground text-sm">Bem-vindo ao Portal do Cidadão</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Olá, {account?.name ?? 'cidadão'}
        </h1>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="text-primary h-4 w-4" />
              Alunos vinculados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck className="text-primary h-4 w-4" />
              Boletim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Notas por componente e período.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="text-primary h-4 w-4" />
              Comunicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/cidadao/comunicados">Ver comunicados</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Alunos</h2>
        {!token ? (
          <Skeleton className="h-28 w-full" />
        ) : students.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-8 text-sm">
              Nenhum aluno vinculado a esta conta.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle>{student.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={`/cidadao/alunos/${student.id}/boletim`}>
                      <BookOpenCheck className="h-4 w-4" />
                      Boletim
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/cidadao/alunos/${student.id}/frequencia`}>
                      <CalendarCheck className="h-4 w-4" />
                      Frequência
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
