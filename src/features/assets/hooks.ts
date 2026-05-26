'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createResource,
  deleteResource,
  getResource,
  listResource,
  updateResource,
  type ListParams,
} from '@/lib/api-client';
import type { Asset, AssetMovement } from './types';

const RESOURCE = 'assets';
const KEY = ['assets'] as const;

/** Lista paginada de bens patrimoniais (com filtros/busca/cursor). */
export function useAssets(params: ListParams) {
  return useQuery({
    queryKey: [...KEY, params],
    queryFn: () => listResource<Asset>(RESOURCE, params),
    placeholderData: (prev) => prev,
  });
}

/** Um bem por id (páginas de detalhe e edição). */
export function useAsset(id: string) {
  return useQuery({
    queryKey: [...KEY, 'detail', id],
    queryFn: () => getResource<Asset>(RESOURCE, id),
    enabled: Boolean(id),
  });
}

/** Movimentações de um bem específico. */
export function useAssetMovements(assetId: string) {
  return useQuery({
    queryKey: ['asset-movements', 'by-asset', assetId],
    queryFn: () =>
      listResource<AssetMovement>('asset-movements', {
        filter: { asset_id: assetId },
        limit: 100,
      }),
    enabled: Boolean(assetId),
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createResource<Asset>(RESOURCE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      updateResource<Asset>(RESOURCE, id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResource(RESOURCE, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAssets() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => deleteResource(RESOURCE, id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
