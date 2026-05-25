'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEMO_PERSONAS, findPersona, type DemoPersona } from '@/data/personas';

/**
 * Sessão de DEMONSTRAÇÃO (não é auth real). Persiste o role da persona
 * escolhida em localStorage + cookie, para o dashboard saber "quem" está
 * navegando. Será trocado pelo fluxo OAuth (Passport) quando a API conectar.
 */

const KEY = 'educari_demo_role';

function readRole(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY);
}

export function setDemoRole(role: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, role);
  // cookie p/ eventual leitura no middleware/SSR (1 dia)
  document.cookie = `${KEY}=${role}; path=/; max-age=86400; samesite=lax`;
  window.dispatchEvent(new Event('educari-session'));
}

export function clearDemoRole() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
  document.cookie = `${KEY}=; path=/; max-age=0`;
  window.dispatchEvent(new Event('educari-session'));
}

export interface DemoSession {
  /** undefined enquanto carrega; null = sem sessão */
  persona: DemoPersona | null | undefined;
  ready: boolean;
}

export function useDemoSession(): DemoSession {
  const [role, setRole] = useState<string | null | undefined>(undefined);

  const sync = useCallback(() => setRole(readRole()), []);

  useEffect(() => {
    sync();
    window.addEventListener('educari-session', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('educari-session', sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  return {
    persona: role === undefined ? undefined : role ? (findPersona(role) ?? null) : null,
    ready: role !== undefined,
  };
}

export { DEMO_PERSONAS };
