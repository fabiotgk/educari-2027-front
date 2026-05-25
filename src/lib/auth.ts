'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Autenticação real contra o backend (educari-2027-infra, Sanctum).
 * Token + usuário persistidos em localStorage. Sem dados fictícios.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost';

const TOKEN_KEY = 'educari_token';
const USER_KEY = 'educari_user';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  tenant?: { slug: string; name: string } | null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function readUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

function persist(token: string, user: AuthUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; samesite=lax`;
  window.dispatchEvent(new Event('educari-auth'));
}

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 422) {
      throw new Error('E-mail ou senha incorretos.');
    }
    throw new Error('Não foi possível entrar. Tente novamente.');
  }

  const data = await res.json();
  const token: string = data.token ?? data.access_token;
  const user: AuthUser = data.user ?? data.data;
  if (!token || !user) throw new Error('Resposta de login inválida do servidor.');
  persist(token, user);
}

export function logout() {
  if (typeof window === 'undefined') return;
  const token = getToken();
  // best-effort: revoga no servidor
  if (token) {
    fetch(`${API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    }).catch(() => {});
  }
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  window.dispatchEvent(new Event('educari-auth'));
}

export interface SessionState {
  user: AuthUser | null | undefined; // undefined = carregando
  ready: boolean;
}

export function useAuth(): SessionState {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const sync = useCallback(() => setUser(readUser()), []);

  useEffect(() => {
    sync();
    window.addEventListener('educari-auth', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('educari-auth', sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  return { user, ready: user !== undefined };
}
