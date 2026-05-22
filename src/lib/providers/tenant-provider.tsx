'use client';

import { createContext, useContext, useMemo } from 'react';
import type { TenantConfig } from '@/types/tenant';

interface TenantContextValue {
  tenant: TenantConfig;
  hasFeature: (featureKey: string) => boolean;
  isModuleEnabled: (moduleCode: string) => boolean;
}

const TenantContext = createContext<TenantContextValue | null>(null);

interface TenantProviderProps {
  tenant: TenantConfig;
  children: React.ReactNode;
}

/**
 * Provider que disponibiliza configuração do tenant atual para
 * toda a árvore de componentes — incluindo theme, feature flags
 * e settings.
 *
 * Ver docs/adr/008-customizacao-tenant.md e ADR-019.
 */
export function TenantProvider({ tenant, children }: TenantProviderProps) {
  const value = useMemo<TenantContextValue>(() => {
    const flagsMap = new Map(
      tenant.feature_flags.map((f) => [f.feature_key, f.enabled])
    );

    return {
      tenant,
      hasFeature: (featureKey: string) => flagsMap.get(featureKey) ?? false,
      isModuleEnabled: (moduleCode: string) => {
        // moduleCode = "M01", "M03", etc — encontra prefixo
        for (const [key, enabled] of flagsMap.entries()) {
          if (key.startsWith(`${moduleCode}_`) && enabled) {
            return true;
          }
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
  if (!ctx) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }
  return ctx;
}

/**
 * Aplica CSS variables do tema do tenant no :root.
 * Permite tematização dinâmica sem rebuild.
 */
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
