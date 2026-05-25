'use client';

/**
 * Cliente HTTP tipado contra a API Educari (educari/api — Laravel + Sanctum).
 *
 * Padrões do backend (ver front/docs/CRUD-PATTERN.md):
 *   - Auth: header `Authorization: Bearer <token>` (token em localStorage).
 *   - Tenant: resolvido automaticamente pelo backend a partir do token.
 *   - Lista: envelope `{ data: T[], links, meta: { next_cursor, prev_cursor } }`
 *     com paginação por cursor (`?limit=50&cursor=...`).
 *   - Detalhe/criação/edição: o Resource é retornado direto (sem envelope).
 *   - Filtros: `?filter[campo]=valor` / `?filter[campo][contains]=texto`.
 *   - Erros de validação: 422 `{ message, errors: { campo: [".."] } }`.
 */

import { API_URL, getToken, logout } from '@/lib/auth';

/** Erro de API com status HTTP e (se 422) erros por campo. */
export class ApiError extends Error {
  readonly status: number;
  /** Mapa campo → mensagens, vindo de respostas 422. */
  readonly errors: Record<string, string[]>;

  constructor(status: number, message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** true quando é erro de validação (422) — usar com applyApiErrors(). */
  get isValidation(): boolean {
    return this.status === 422;
  }
}

/** Envelope de lista paginada por cursor. */
export interface Paginated<T> {
  data: T[];
  meta: {
    next_cursor: string | null;
    prev_cursor: string | null;
    per_page: number;
    path: string;
  };
}

/** Parâmetros de listagem: filtros, limite e cursor. */
export interface ListParams {
  /** Filtros simples: { type: 'municipal' } → ?filter[type]=municipal */
  filter?: Record<string, string | number | boolean | undefined>;
  /** Busca textual em um campo: { name: 'silva' } → ?filter[name][contains]=silva */
  search?: Record<string, string | undefined>;
  limit?: number;
  cursor?: string | null;
}

function buildQuery(params?: ListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.filter) {
    for (const [k, v] of Object.entries(params.filter)) {
      if (v !== undefined && v !== '') qs.set(`filter[${k}]`, String(v));
    }
  }
  if (params.search) {
    for (const [k, v] of Object.entries(params.search)) {
      if (v) qs.set(`filter[${k}][contains]`, v);
    }
  }
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.cursor) qs.set('cursor', params.cursor);
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/**
 * Núcleo do cliente. Injeta token, trata 401 (encerra sessão) e
 * normaliza erros em ApiError. Lança em qualquer status >= 400.
 */
async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    // Token expirado/inválido: encerra sessão e manda para o login.
    logout();
    if (typeof window !== 'undefined') window.location.href = '/login';
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
      body.errors ?? {},
    );
  }

  return payload as T;
}

/** GET de lista paginada. */
export function listResource<T>(resource: string, params?: ListParams): Promise<Paginated<T>> {
  return apiFetch<Paginated<T>>(`/api/v1/${resource}${buildQuery(params)}`);
}

/**
 * Endpoints de recurso único (show/store/update) embrulham o Resource
 * num envelope `{ data: {...} }` (JsonResource). Desembrulhamos aqui para
 * a tela receber o objeto direto.
 */
function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/** GET de um recurso por id. */
export async function getResource<T>(resource: string, id: string): Promise<T> {
  return unwrap<T>(await apiFetch<unknown>(`/api/v1/${resource}/${id}`));
}

/** POST — cria um recurso (retorna o Resource criado, 201). */
export async function createResource<T>(resource: string, body: unknown): Promise<T> {
  return unwrap<T>(
    await apiFetch<unknown>(`/api/v1/${resource}`, { method: 'POST', body: JSON.stringify(body) }),
  );
}

/** PATCH — atualiza um recurso. */
export async function updateResource<T>(resource: string, id: string, body: unknown): Promise<T> {
  return unwrap<T>(
    await apiFetch<unknown>(`/api/v1/${resource}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  );
}

/** DELETE — remove um recurso (soft-delete no backend, 204). */
export function deleteResource(resource: string, id: string): Promise<void> {
  return apiFetch<void>(`/api/v1/${resource}/${id}`, { method: 'DELETE' });
}

export { apiFetch };
