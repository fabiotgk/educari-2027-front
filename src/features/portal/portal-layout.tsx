'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, GraduationCap, LogOut, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PortalAuthGate, usePortalAuth } from '@/lib/providers/portal-auth-provider';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/portal', label: 'Início' },
  { href: '/portal/comunicados', label: 'Comunicados' },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalAuthGate>
      <PortalShell>{children}</PortalShell>
    </PortalAuthGate>
  );
}

function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { account, token, logout } = usePortalAuth();
  const isLogin = pathname === '/portal/login';

  if (isLogin) return children;

  return (
    <div className="bg-muted/30 flex h-screen flex-col overflow-hidden">
      <header className="bg-background shrink-0 border-b">
        <div className="flex h-16 items-center justify-between gap-4 px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm leading-5 font-semibold">Portal do Cidadão</p>
              <p className="text-muted-foreground truncate text-xs">
                {account?.name ?? 'Acesso do responsável e aluno'}
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação do portal">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                size="sm"
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" aria-label="Comunicados">
              <Link href="/portal/comunicados">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>
            <div className="hidden min-w-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 lg:flex">
              <UserRound className="text-muted-foreground h-4 w-4" />
              <span className="max-w-48 truncate text-sm">{account?.name}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!token}
              onClick={() => {
                logout();
                router.replace('/portal/login');
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 border-t px-6 py-2 md:hidden" aria-label="Navegação do portal">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              size="sm"
              className={cn('flex-1', pathname === item.href && 'font-semibold')}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </header>
      <main className="min-h-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
