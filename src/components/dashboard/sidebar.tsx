'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { useTenant } from '@/lib/providers/tenant-provider';
import { NAV_GROUPS, NAV_OVERVIEW, type NavItem } from '@/data/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function isRouteActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Icon({ name, className }: { name: string; className?: string }) {
  const C =
    (Icons[name as keyof typeof Icons] as React.ComponentType<{ className?: string }>) ?? Icons.Square;
  return <C className={className} />;
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { hasFeature, tenant } = useTenant();

  // Menu cujo submenu contém a rota ativa (para auto-abrir).
  const activeParent = React.useMemo(() => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (item.children?.some((c) => isRouteActive(pathname, c.href))) return item.label;
      }
    }
    return null;
  }, [pathname]);

  const [open, setOpen] = React.useState<Set<string>>(
    () => new Set(activeParent ? [activeParent] : []),
  );

  React.useEffect(() => {
    if (activeParent) setOpen((prev) => (prev.has(activeParent) ? prev : new Set(prev).add(activeParent)));
  }, [activeParent]);

  const toggle = (label: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });

  return (
    <aside className={cn('flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground', className)}>
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

      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        <TooltipProvider delayDuration={100}>
          <nav className="space-y-5">
            <LeafItem item={NAV_OVERVIEW} active={isRouteActive(pathname, '/')} enabled />

            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/45">
                  {group.label}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const enabled = item.moduleKey ? hasFeature(item.moduleKey) : true;

                    if (item.children) {
                      return (
                        <ExpandableItem
                          key={item.label}
                          item={item}
                          enabled={enabled}
                          isOpen={open.has(item.label)}
                          onToggle={() => toggle(item.label)}
                          pathname={pathname}
                        />
                      );
                    }

                    return (
                      <LeafItem
                        key={item.label}
                        item={item}
                        active={isRouteActive(pathname, item.href!)}
                        enabled={enabled}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
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

/** Item folha (link direto). */
function LeafItem({ item, active, enabled }: { item: NavItem; active: boolean; enabled: boolean }) {
  const content = (
    <Link
      href={enabled ? item.href! : '#'}
      aria-disabled={!enabled}
      onClick={(e) => {
        if (!enabled) e.preventDefault();
      }}
      className={cn(
        'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
        !active && enabled && 'text-sidebar-foreground hover:bg-sidebar-accent/60',
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
      <Icon name={item.icon} className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  );

  if (!enabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">Módulo não contratado</TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

/** Menu expansível (com submenu). */
function ExpandableItem({
  item,
  enabled,
  isOpen,
  onToggle,
  pathname,
}: {
  item: NavItem;
  enabled: boolean;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const hasActiveChild = item.children!.some((c) => isRouteActive(pathname, c.href));

  if (!enabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/35">
            <Icon name={item.icon} className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">Módulo não contratado</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          hasActiveChild && !isOpen ? 'text-white' : 'text-sidebar-foreground',
          'hover:bg-sidebar-accent/60',
        )}
      >
        <Icon name={item.icon} className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          className={cn('h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-transform', isOpen && 'rotate-90')}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <li className="mt-0.5 ml-5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
              {item.children!.map((child) => {
                const active = isRouteActive(pathname, child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-[13px] transition-colors',
                      active
                        ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                    )}
                  >
                    {child.label}
                  </Link>
                );
              })}
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
