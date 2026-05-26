'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { portalFetch, PORTAL_ACCOUNT_KEY, PORTAL_TOKEN_KEY } from '@/lib/portal-api';
import { usePortalMe } from '@/features/portal/hooks';
import type {
  ApiEnvelope,
  PortalAccount,
  PortalLoginPayload,
  PortalLoginResponse,
  PortalStudent,
} from '@/features/portal/types';

interface PortalAuthContextValue {
  account: PortalAccount | null;
  students: PortalStudent[];
  token: string | null;
  ready: boolean;
  login: (payload: PortalLoginPayload) => Promise<void>;
  logout: () => void;
}

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

function readStoredAccount(): PortalAccount | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(PORTAL_ACCOUNT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PortalAccount;
  } catch {
    window.localStorage.removeItem(PORTAL_ACCOUNT_KEY);
    return null;
  }
}

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(PORTAL_TOKEN_KEY);
}

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [account, setAccount] = useState<PortalAccount | null>(null);
  const [ready, setReady] = useState(false);

  const sync = useCallback(() => {
    setToken(readStoredToken());
    setAccount(readStoredAccount());
    setReady(true);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener('educari-portal-auth', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('educari-portal-auth', sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  const meQuery = usePortalMe(Boolean(token));

  useEffect(() => {
    if (!meQuery.data) return;
    setAccount(meQuery.data.account);
    window.localStorage.setItem(PORTAL_ACCOUNT_KEY, JSON.stringify(meQuery.data.account));
  }, [meQuery.data]);

  const login = useCallback(
    async (payload: PortalLoginPayload) => {
      const response = await portalFetch<ApiEnvelope<PortalLoginResponse>>('/api/v1/portal/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      window.localStorage.setItem(PORTAL_TOKEN_KEY, response.data.token);
      window.localStorage.setItem(PORTAL_ACCOUNT_KEY, JSON.stringify(response.data.account));
      setToken(response.data.token);
      setAccount(response.data.account);
      window.dispatchEvent(new Event('educari-portal-auth'));
      window.dispatchEvent(new Event('educari-auth'));
      await queryClient.invalidateQueries({ queryKey: ['portal'] });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(PORTAL_TOKEN_KEY);
    window.localStorage.removeItem(PORTAL_ACCOUNT_KEY);
    setToken(null);
    setAccount(null);
    queryClient.removeQueries({ queryKey: ['portal'] });
    window.dispatchEvent(new Event('educari-portal-auth'));
    window.dispatchEvent(new Event('educari-auth'));
  }, [queryClient]);

  const value = useMemo<PortalAuthContextValue>(
    () => ({
      account,
      students: meQuery.data?.students ?? [],
      token,
      ready,
      login,
      logout,
    }),
    [account, login, logout, meQuery.data?.students, ready, token]
  );

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

export function usePortalAuth(): PortalAuthContextValue {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error('usePortalAuth deve ser usado dentro de PortalAuthProvider');
  return ctx;
}

export const useportalAuth = usePortalAuth;

export function PortalAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, ready } = usePortalAuth();
  const isLogin = pathname === '/cidadao/login';

  useEffect(() => {
    if (!ready) return;
    if (!token && !isLogin) router.replace('/cidadao/login');
    if (token && isLogin) router.replace('/cidadao');
  }, [isLogin, ready, router, token]);

  if (!ready) {
    return (
      <main className="bg-muted/30 flex min-h-screen items-center justify-center p-6">
        <p className="text-muted-foreground text-sm">Carregando portal...</p>
      </main>
    );
  }

  if (!token && !isLogin) return null;

  return children;
}
