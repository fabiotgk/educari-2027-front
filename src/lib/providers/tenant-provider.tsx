'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { TenantConfig } from '@/types/tenant';
import { apiFetch } from '@/lib/api-client';
import { getToken } from '@/lib/auth';

interface TenantContextValue {
  tenant: TenantConfig;
  hasFeature: (featureKey: string) => boolean;
  isModuleEnabled: (moduleCode: string) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  /** Fallback visual usado antes do fetch e em telas sem sessão (ex.: login). */
  fallback: TenantConfig;
  children: React.ReactNode;
}

/**
 * Disponibiliza a configuração do tenant atual (tema + feature flags +
 * settings) para a árvore. Em rotas autenticadas, busca a configuração
 * real em GET /api/v1/tenant/me; sem sessão, usa o fallback (paleta
 * default + flags vazias). Quando o marketplace altera flags, ele
 * invalida `['tenant','me']` e a sidebar reage na hora.
 */
export function TenantProvider({ fallback, children }: TenantProviderProps) {
  // Token é client-only; observamos mudanças para refetch após login/logout.
  const [hasToken, setHasToken] = useState<boolean>(false);
  useEffect(() => {
    const sync = () => setHasToken(Boolean(getToken()));
    sync();
    window.addEventListener('educari-auth', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('educari-auth', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const { data } = useQuery({
    queryKey: ['tenant', 'me'],
    queryFn: () => apiFetch<TenantConfig>('/api/v1/tenant/me'),
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  });

  const tenant = data ?? fallback;

  const value = useMemo<TenantContextValue>(() => {
    const flagsMap = new Map(tenant.feature_flags.map((f) => [f.feature_key, f.enabled]));
    return {
      tenant,
      hasFeature: (featureKey: string) => flagsMap.get(featureKey) ?? false,
      isModuleEnabled: (moduleCode: string) => {
        for (const [key, enabled] of flagsMap.entries()) {
          if (key.startsWith(`${moduleCode}_`) && enabled) return true;
        }
        return false;
      },
    };
  }, [tenant]);

  return (
    <TenantContext.Provider value={value}>
      <TenantThemeStyles tenant={tenant} />
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant deve ser usado dentro de TenantProvider');
  return ctx;
}

/** Aplica CSS variables do tema do tenant. */
function TenantThemeStyles({ tenant }: { tenant: TenantConfig }) {
  const css = `
    :root {
      --tenant-primary: ${tenant.theme.primary_color};
      --tenant-secondary: ${tenant.theme.secondary_color};
      --tenant-accent: ${tenant.theme.accent_color};
    }
  `;
  // eslint-disable-next-line react/no-danger
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
