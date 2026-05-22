'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTenant } from '@/lib/providers/tenant-provider';
import { MODULES, MODULE_GROUPS } from '@/data/modules';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { hasFeature, tenant } = useTenant();

  // Agrupa módulos por categoria preservando ordem do catálogo
  const grouped = (Object.keys(MODULE_GROUPS) as Array<keyof typeof MODULE_GROUPS>)
    .map((group) => ({
      group,
      label: MODULE_GROUPS[group],
      modules: MODULES.filter((m) => m.group === group),
    }));

  return (
    <aside
      className={cn(
        'flex h-full w-72 flex-col border-r bg-card text-card-foreground',
        className
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: 'var(--tenant-primary)' }}
        >
          <Icons.GraduationCap className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold leading-tight">Educari</span>
          <span className="text-xs text-muted-foreground leading-tight">
            {tenant.theme.institutional_short_name ?? 'SaaS Educacional'}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <TooltipProvider delayDuration={100}>
          <nav className="space-y-6">
            <SidebarItem
              href="/"
              label="Visão Geral"
              icon="LayoutDashboard"
              active={pathname === '/'}
              enabled
            />

            {grouped.map(({ group, label, modules }) => (
              <div key={group}>
                <div className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {label}
                </div>
                <div className="space-y-0.5">
                  {modules.map((mod) => {
                    const enabled = hasFeature(mod.key);
                    return (
                      <SidebarItem
                        key={mod.key}
                        href={mod.href}
                        label={mod.label}
                        code={mod.code}
                        icon={mod.icon}
                        active={pathname.startsWith(mod.href) && mod.href !== '/'}
                        enabled={enabled}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            <div>
              <div className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sistema
              </div>
              <SidebarItem
                href="/configuracoes"
                label="Configurações"
                icon="Settings"
                active={pathname.startsWith('/configuracoes')}
                enabled
              />
            </div>
          </nav>
        </TooltipProvider>
      </ScrollArea>

      <div className="border-t p-4 text-[10px] leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">
          {tenant.theme.institutional_name}
        </p>
        <p>
          {tenant.theme.institutional_city} — {tenant.theme.institutional_state}
        </p>
        <p className="mt-1.5">Educari © 2026 · v0.1.0</p>
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  href: string;
  label: string;
  code?: string;
  icon: string;
  active: boolean;
  enabled: boolean;
}

function SidebarItem({ href, label, code, icon, active, enabled }: SidebarItemProps) {
  const IconComponent = (Icons[icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>) ?? Icons.Square;

  const content = (
    <Link
      href={enabled ? href : '#'}
      aria-disabled={!enabled}
      onClick={(e) => {
        if (!enabled) e.preventDefault();
      }}
      className={cn(
        'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        active && 'bg-accent text-accent-foreground font-medium',
        !active && enabled && 'hover:bg-accent/60',
        !enabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute left-0 h-6 w-1 rounded-r-full"
          style={{ backgroundColor: 'var(--tenant-primary)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <IconComponent className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {code && (
        <span className="text-[10px] font-mono text-muted-foreground">
          {code}
        </span>
      )}
    </Link>
  );

  if (!enabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">
          <span>Módulo não contratado</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
