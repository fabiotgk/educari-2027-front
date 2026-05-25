'use client';

import * as React from 'react';
import * as Icons from 'lucide-react';
import { CalendarClock, Check, Lock, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Topbar } from '@/components/dashboard/topbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/crud/page-header';
import { StatCards, type Stat } from '@/components/crud/stat-cards';
import { formatDate } from '@/lib/format';
import { toastError, toastInfo, toastSuccess } from '@/lib/toast';
import { moduleState, type ModuleCatalogItem, type ModuleState } from './types';
import { useModuleCatalog, useToggleModule } from './hooks';

const STATE_BADGE: Record<ModuleState, { label: string; className: string }> = {
  enabled: { label: 'Habilitado', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' },
  contracted: { label: 'Contratado', className: 'border-primary/30 bg-primary/10 text-primary' },
  available: { label: 'Disponível', className: 'border-border bg-muted text-muted-foreground' },
  coming_soon: { label: 'Em breve', className: 'border-amber-500/30 bg-amber-500/10 text-amber-700' },
};

export function MarketplacePage() {
  const { data: modules, isLoading, isError } = useModuleCatalog();
  const toggle = useToggleModule();
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);

  const onToggle = (m: ModuleCatalogItem, next: boolean) => {
    setPendingKey(m.feature_key);
    toggle.mutate(
      { featureKey: m.feature_key, enabled: next },
      {
        onSuccess: () => toastSuccess(next ? `${m.name} habilitado.` : `${m.name} desabilitado.`),
        onError: (e) => toastError(e),
        onSettled: () => setPendingKey(null),
      },
    );
  };

  const stats: Stat[] = [
    { label: 'Habilitados', value: modules?.filter((m) => moduleState(m) === 'enabled').length ?? 0, icon: 'CircleCheck', accent: 'success' },
    { label: 'Contratados', value: modules?.filter((m) => m.contracted).length ?? 0, icon: 'PackageCheck', accent: 'primary' },
    { label: 'Disponíveis', value: modules?.filter((m) => moduleState(m) === 'available').length ?? 0, icon: 'ShoppingCart', accent: 'muted' },
    { label: 'Em breve', value: modules?.filter((m) => m.status === 'coming_soon').length ?? 0, icon: 'Sparkles', accent: 'warning' },
  ];

  // Agrupa por categoria preservando a ordem do catálogo
  const categories = React.useMemo(() => {
    const map = new Map<string, ModuleCatalogItem[]>();
    for (const m of modules ?? []) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return [...map.entries()];
  }, [modules]);

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Configurações' }, { label: 'Módulos' }]} />
      <main className="flex-1 overflow-auto bg-muted/30">
        <div className="space-y-6 p-6 lg:p-8">
          <PageHeader
            title="Módulos da plataforma"
            description="Habilite os módulos contratados pela sua rede. Os demais podem ser contratados junto à Educari."
          />

          <StatCards stats={stats} loading={isLoading} />

          {isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Não foi possível carregar o catálogo de módulos.
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map(([category, items]) => (
                <section key={category} className="space-y-3">
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">
                    {category}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {items.length} {items.length === 1 ? 'módulo' : 'módulos'}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((m) => (
                      <ModuleCard
                        key={m.feature_key}
                        module={m}
                        pending={pendingKey === m.feature_key}
                        onToggle={onToggle}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function ModuleCard({
  module: m,
  pending,
  onToggle,
}: {
  module: ModuleCatalogItem;
  pending: boolean;
  onToggle: (m: ModuleCatalogItem, next: boolean) => void;
}) {
  const state = moduleState(m);
  const badge = STATE_BADGE[state];
  const Icon =
    (m.icon && (Icons[m.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>)) ||
    Icons.Box;

  return (
    <Card
      className={cn(
        'flex flex-col gap-3 p-4 transition-colors',
        state === 'enabled' && 'border-primary/30',
        state === 'coming_soon' && 'opacity-75',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            state === 'enabled' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{m.name}</p>
          <p className="text-xs text-muted-foreground">
            {m.code} · {m.subcategory}
          </p>
        </div>
        <Badge variant="outline" className={badge.className}>
          {badge.label}
        </Badge>
      </div>

      <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{m.description}</p>

      {/* Rodapé / ação por estado */}
      <div className="flex items-center justify-between border-t pt-3">
        {state === 'coming_soon' ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" /> Em desenvolvimento
          </span>
        ) : state === 'available' ? (
          <>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" /> Não contratado
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toastInfo('Solicitação enviada à equipe Educari.')}
            >
              Solicitar
            </Button>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {m.enabled ? (
                <>
                  <Check className="size-3.5 text-emerald-600" /> Ativo no sistema
                </>
              ) : m.contract_ends_at ? (
                <>
                  <CalendarClock className="size-3.5" /> até {formatDate(m.contract_ends_at)}
                </>
              ) : (
                'Contratado'
              )}
            </span>
            <Switch
              checked={m.enabled}
              disabled={pending}
              onCheckedChange={(v) => onToggle(m, v)}
              aria-label={`Habilitar ${m.name}`}
            />
          </>
        )}
      </div>
    </Card>
  );
}
