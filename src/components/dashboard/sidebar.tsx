'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTenant } from '@/lib/providers/tenant-provider';
import { MODULES, MODULE_GROUPS } from '@/data/modules';
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

  const grouped = (Object.keys(MODULE_GROUPS) as Array<keyof typeof MODULE_GROUPS>).map(
    (group) => ({
      group,
      label: MODULE_GROUPS[group],
      modules: MODULES.filter((m) => m.group === group),
    }),
  );

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      {/* Marca */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
          <Icons.GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold leading-tight text-white">Educari</span>
          <span className="text-xs leading-tight text-sidebar-foreground/55">
            {tenant.theme.institutional_short_name ?? 'Gestão Educacional'}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <TooltipProvider delayDuration={100}>
          <nav className="space-y-5">
            <SidebarItem href="/" label="Visão Geral" icon="LayoutDashboard" active={pathname === '/'} enabled />

            {grouped.map(({ group, label, modules }) => (
              <div key={group}>
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                  {label}
                </div>
                <div className="space-y-0.5">
                  {modules.map((mod) => (
                    <SidebarItem
                      key={mod.key}
                      href={mod.href}
                      label={mod.label}
                      code={mod.code}
                      icon={mod.icon}
                      active={pathname.startsWith(mod.href) && mod.href !== '/'}
                      enabled={hasFeature(mod.key)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div>
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                Sistema
              </div>
              <SidebarItem href="/configuracoes" label="Configurações" icon="Settings" active={pathname.startsWith('/configuracoes')} enabled />
            </div>
          </nav>
        </TooltipProvider>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-4 text-[10px] leading-relaxed text-sidebar-foreground/45">
        <p className="font-medium text-sidebar-foreground">{tenant.theme.institutional_name}</p>
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
  const IconComponent =
    (Icons[icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>) ?? Icons.Square;

  const content = (
    <Link
      href={enabled ? href : '#'}
      aria-disabled={!enabled}
      onClick={(e) => {
        if (!enabled) e.preventDefault();
      }}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
        !active && enabled && 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
        !enabled && 'cursor-not-allowed text-sidebar-foreground/35',
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute left-0 h-5 w-1 rounded-r-full bg-primary"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <IconComponent className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {code && <span className="font-mono text-[10px] text-sidebar-foreground/45">{code}</span>}
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
