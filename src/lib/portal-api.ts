'use client';

import { API_URL } from '@/lib/auth';
import { ApiError } from '@/lib/api-client';

export const PORTAL_TOKEN_KEY = 'educari-portal-token';
export const PORTAL_ACCOUNT_KEY = 'educari-portal-account';

export function getPortalToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PORTAL_TOKEN_KEY);
}

export function clearPortalSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PORTAL_TOKEN_KEY);
  window.localStorage.removeItem(PORTAL_ACCOUNT_KEY);
  window.dispatchEvent(new Event('educari-portal-auth'));
  window.dispatchEvent(new Event('educari-auth'));
}

export async function portalFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getPortalToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearPortalSession();
    if (typeof window !== 'undefined') window.location.href = '/portal/login';
    throw new ApiError(401, 'Sessão expirada. Entre novamente.');
  }

  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const body = (payload ?? {}) as { message?: string; errors?: Record<string, string[]> };
    throw new ApiError(
      res.status,
      body.message ?? 'Não foi possível concluir a operação.',
      body.errors ?? {}
    );
  }

  return payload as T;
}

export function unwrapData<T>(payload: { data: T }): T {
  return payload.data;
}
