'use client';

import { Bell, ChevronDown, HelpCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/providers/tenant-provider';
import { MOCK_TENANTS } from '@/data/mock';
import { useDemoSession, clearDemoRole } from '@/lib/use-demo-session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function Topbar({ breadcrumbs }: TopbarProps) {
  const { tenant } = useTenant();
  const router = useRouter();
  const { persona } = useDemoSession();
  const currentTenantOption = MOCK_TENANTS.find((t) => t.slug === tenant.slug);

  const displayName = persona?.name ?? 'Visitante';
  const displayRole = persona?.title ?? 'Demonstração';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  function switchPersona() {
    router.push('/login');
  }
  function signOut() {
    clearDemoRole();
    router.replace('/login');
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Switch de Tenant */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 px-3 text-sm font-medium hover:bg-accent"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-white"
              style={{ backgroundColor: 'var(--tenant-primary)' }}>
              {tenant.theme.institutional_state}
            </div>
            <span className="truncate max-w-48">
              {currentTenantOption?.short_name ?? tenant.theme.institutional_short_name}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72" align="start">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Tenants disponíveis
          </DropdownMenuLabel>
          {MOCK_TENANTS.map((opt) => (
            <DropdownMenuItem
              key={opt.slug}
              className="flex flex-col items-start gap-0.5 py-2"
            >
              <span className="font-medium">{opt.short_name}</span>
              <span className="text-xs text-muted-foreground">{opt.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-muted-foreground">
            (Switch real requer permissão de super-admin devnx)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <span className="text-border">/</span>}
              <span className={idx === breadcrumbs.length - 1 ? 'text-foreground' : ''}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      )}

      <div className="flex-1" />

      {/* Busca global */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar alunos, turmas, escolas..."
          className="pl-9 h-9"
        />
      </div>

      {/* Notificações */}
      <Button variant="ghost" size="icon" className="relative h-9 w-9">
        <Bell className="h-4 w-4" />
        <Badge className="absolute -right-1 -top-1 h-4 w-4 justify-center rounded-full p-0 text-[10px]"
          style={{ backgroundColor: 'var(--tenant-accent)' }}>
          3
        </Badge>
      </Button>

      {/* Ajuda */}
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* Perfil */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-medium">{displayName}</span>
              <span className="text-[10px] text-muted-foreground">{displayRole}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {displayRole}
            {persona?.context ? ` · ${persona.context}` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Meu perfil</DropdownMenuItem>
          <DropdownMenuItem>Preferências</DropdownMenuItem>
          <DropdownMenuItem>Dados (LGPD)</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={switchPersona}>Trocar perfil</DropdownMenuItem>
          <DropdownMenuItem onClick={signOut}>Sair da demonstração</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
