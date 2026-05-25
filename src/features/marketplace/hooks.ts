'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';
import type { ModuleCatalogItem } from './types';

const KEY = ['modules', 'catalog'] as const;

/** Catálogo de módulos do tenant atual (contratado/habilitado/em breve). */
export function useModuleCatalog() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => apiFetch<{ data: ModuleCatalogItem[] }>('/api/v1/modules/catalog'),
    select: (res) => res.data,
  });
}

/** Liga/desliga um módulo contratado. */
export function useToggleModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ featureKey, enabled }: { featureKey: string; enabled: boolean }) =>
      apiFetch<{ feature_key: string; enabled: boolean }>(
        `/api/v1/modules/${featureKey}/toggle`,
        { method: 'PATCH', body: JSON.stringify({ enabled }) },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
