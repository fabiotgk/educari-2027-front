'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoSession } from '@/lib/use-demo-session';

/**
 * Protege as rotas do dashboard na demo: se não há persona escolhida,
 * manda para /login. Some quando o fluxo OAuth real entrar.
 */
export function DemoGuard({ children }: { children: React.ReactNode }) {
  const { persona, ready } = useDemoSession();
  const router = useRouter();

  useEffect(() => {
    if (ready && !persona) router.replace('/login');
  }, [ready, persona, router]);

  if (!ready || !persona) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Carregando…
      </div>
    );
  }

  return <>{children}</>;
}
