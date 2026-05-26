import { test, type Page, type Response as PlaywrightResponse } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const ADMIN_ROUTES = [
  '/',
  '/cadastros',
  '/alunos',
  '/responsaveis',
  '/matriculas',
  '/calendario',
  '/comunicacao',
  '/documentos',
  '/transporte',
  '/alimentacao',
  '/financeiro',
  '/patrimonio',
  '/biblioteca',
  '/material',
  '/helpdesk',
  '/ava',
  '/ava/modulos',
  '/ava/aulas',
  '/ava/avisos',
  '/ava/avaliacoes',
  '/ava/foruns',
  '/ava/matriculas',
  '/auditoria',
  '/facial',
  '/ia-redacao',
  '/ia-adaptativo',
  '/pnae-estadual',
  '/cursos-livres',
  '/marketplace',
];

type RouteResult = {
  route: string;
  status: number | null;
  console: string[];
  ok: boolean;
  cause: string | null;
};

type SmokeReport = {
  admin: RouteResult[];
  avaTabs: Record<string, { ok: boolean; count: number; cause: string | null }>;
  portal: {
    login: { ok: boolean; cause: string | null };
    painel: { ok: boolean; cause: string | null };
    boletim: { ok: boolean; cause: string | null };
  };
};

const outDir = '/tmp/educari-smoke';
const reportPath = path.join(outDir, 'report.json');
const frontUrl = (process.env.EDUCARI_FRONT_URL ?? 'http://localhost:3033').replace(/\/$/, '');
const apiUrl = (
  process.env.EDUCARI_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost'
).replace(/\/$/, '');
const AUTH_TOKEN_KEY = 'educari_token';
const AUTH_USER_KEY = 'educari_user';
const AUTH_EVENT = 'educari-auth';
const AVA_TABS = ['Módulos', 'Matrículas', 'Avisos', 'Fóruns'];
const AVA_TAB_EMPTY_MESSAGE = /Nenhum|Nenhuma/i;
const DEFAULT_AUTH_USER = {
  id: 'smoke-admin',
  name: 'Smoke Admin',
  email: 'admin@mariana.mg.gov.br',
  roles: ['tenant.super_admin'],
  tenant: { slug: 'mariana', name: 'Prefeitura Municipal de Mariana' },
};

test.setTimeout(360_000);

test.beforeEach(async ({ page }) => {
  const adminToken = process.env.EDUCARI_ADMIN_TOKEN ?? '';
  await page.addInitScript(({ token, user }) => {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event(AUTH_EVENT));
    document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=86400; samesite=lax`;
  }, {
    token: adminToken,
    user: DEFAULT_AUTH_USER,
  });
});

async function hydrateAuthState(page: Page, token: string): Promise<void> {
  await page.evaluate(({ token, user, tokenKey, userKey, eventName }) => {
    window.localStorage.setItem(tokenKey, token);
    window.localStorage.setItem(userKey, JSON.stringify(user));
    window.dispatchEvent(new Event(eventName));
  }, {
    token,
    user: DEFAULT_AUTH_USER,
    tokenKey: AUTH_TOKEN_KEY,
    userKey: AUTH_USER_KEY,
    eventName: AUTH_EVENT,
  });
}

test('smoke visual Educari', async ({ page }) => {
  fs.mkdirSync(outDir, { recursive: true });

  const adminToken = process.env.EDUCARI_ADMIN_TOKEN;
  if (!adminToken) throw new Error('EDUCARI_ADMIN_TOKEN não informado.');

  const report: SmokeReport = {
    admin: [],
    avaTabs: {
      'Módulos': { ok: false, count: 0, cause: null },
      'Matrículas': { ok: false, count: 0, cause: null },
      'Avisos': { ok: false, count: 0, cause: null },
      'Fóruns': { ok: false, count: 0, cause: null },
    },
    portal: {
      login: { ok: false, cause: null },
      painel: { ok: false, cause: null },
      boletim: { ok: false, cause: null },
    },
  };

  for (const route of ADMIN_ROUTES) {
    const shouldWaitAuth = route === ADMIN_ROUTES[0];
    let authBootstrapError: string | null = null;

    const consoleMessages: string[] = [];
    const listener = (msg: { type: () => string; text: () => string }) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push(`${msg.type()}: ${msg.text()}`);
      }
    };
    page.on('console', listener);

    let status: number | null = null;
    let cause: string | null = null;
    try {
      let authResponse: Promise<PlaywrightResponse | null> = Promise.resolve(null);
      if (shouldWaitAuth) {
        authResponse = page
          .waitForResponse((response) => {
            let pathname = response.url();
            try {
              pathname = new URL(response.url()).pathname;
            } catch {
              // noop
            }
            return /\/api\/v1\/(tenant\/me|auth\/me)(\?|$)/.test(pathname) && response.status() === 200;
          }, { timeout: 20_000 })
          .catch(() => null);
      }

      const response = await page.goto(url(route), { waitUntil: 'domcontentloaded', timeout: 4_000 });
      if (shouldWaitAuth) {
        const authResponseResult = await authResponse;
        if (!authResponseResult) authBootstrapError = 'Sem resposta autenticada /api/v1/tenant/me ou /api/v1/auth/me';
      }

      status = response?.status() ?? null;
      if (status === null || status >= 400) cause = `status ${status ?? 'sem resposta'}`;
      if (authBootstrapError) cause = authBootstrapError;
      await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
      await page.screenshot({ path: path.join(outDir, `${slug(route)}.png`), fullPage: true });
    } catch (error) {
      cause = error instanceof Error ? error.message : String(error);
    } finally {
      page.off('console', listener);
    }

    if (!cause && consoleMessages.length > 0) cause = consoleMessages[0];
    report.admin.push({
      route,
      status,
      console: consoleMessages,
      ok: !cause,
      cause,
    });
  }

  await validateAvaDetail(page, report);
  await validatePortal(page, report);

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
});

async function validateAvaDetail(page: Page, report: SmokeReport): Promise<void> {
  try {
    const adminToken = process.env.EDUCARI_ADMIN_TOKEN;
    if (!adminToken) throw new Error('EDUCARI_ADMIN_TOKEN não informado.');

    await hydrateAuthState(page, adminToken);

    const courseId = await fetchFirstCourseId(adminToken);
    if (!courseId) throw new Error('nenhum curso retornado por /api/v1/courses');

    await page.goto(url(`/ava/${courseId}`), { waitUntil: 'domcontentloaded', timeout: 8_000 });
    await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
    await page.locator('[role=\"tab\"]').first().waitFor({ timeout: 10_000 });
    await page.screenshot({ path: path.join(outDir, 'ava-detalhe.png'), fullPage: true });

    for (const tab of AVA_TABS) {
      await page.getByRole('tab', { name: tab }).click({ timeout: 5_000 });
      const activePanel = page.locator('[role="tabpanel"][data-state="active"]');
      await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
      await activePanel.waitFor({ timeout: 3_000 }).catch(() => {});
      const hasRows = await activePanel.locator('tbody tr').count();
      const hasCards = await activePanel.locator('[class*="rounded-xl"], [class*="rounded-lg"]').count();
      const emptyText = await activePanel.getByText(AVA_TAB_EMPTY_MESSAGE).count();
      const count = hasRows || hasCards;
      report.avaTabs[tab] = {
        ok: count > 0 || emptyText > 0,
        count,
        cause: count > 0 ? null : emptyText > 0 ? 'vazio honesto (Nenhum/Nenhuma)' : 'sem dados no painel ativo',
      };
      await page.screenshot({ path: path.join(outDir, `ava-${slug(tab)}.png`), fullPage: true });
    }
  } catch (error) {
    for (const tab of Object.keys(report.avaTabs)) {
      report.avaTabs[tab].cause = error instanceof Error ? error.message : String(error);
    }
  }
}

async function fetchFirstCourseId(token: string): Promise<string | null> {
  const response = await fetch(`${apiUrl}/api/v1/courses?limit=1`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`/api/v1/courses retornou ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || !('data' in payload)) return null;
  const data = (payload as { data: unknown }).data;
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  if (!first || typeof first !== 'object' || !('id' in first)) return null;
  const id = (first as { id: unknown }).id;
  return typeof id === 'string' && id.length > 0 ? id : null;
}

async function validatePortal(page: Page, report: SmokeReport): Promise<void> {
  const login = process.env.EDUCARI_PORTAL_LOGIN;
  const password = process.env.EDUCARI_PORTAL_PASSWORD ?? 'senha-demo';
  if (!login) {
    const cause = 'EDUCARI_PORTAL_LOGIN não informado';
    report.portal.login.cause = cause;
    report.portal.painel.cause = cause;
    report.portal.boletim.cause = cause;
    return;
  }

  try {
    await page.goto(url('/cidadao/login'), { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
    await page.locator('#tenant_slug').fill('mariana');
    await page.locator('#login').fill(login);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('**/cidadao', { timeout: 20_000 });
    await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
    report.portal.login.ok = true;
    await page.screenshot({ path: path.join(outDir, 'portal-painel.png'), fullPage: true });

    const hasDashboard = await page.getByRole('heading', { name: /Alunos/i }).isVisible({ timeout: 10_000 });
    const boletimLink = page.locator('a[href*="/cidadao/alunos/"][href$="/boletim"]').first();
    const href = await boletimLink.getAttribute('href', { timeout: 10_000 });
    report.portal.painel = {
      ok: hasDashboard && Boolean(href),
      cause: hasDashboard && href ? null : 'painel sem aluno/boletim vinculado',
    };

    if (!href) throw new Error('nenhum link de boletim encontrado');
    await page.goto(url(href), { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
    await page.screenshot({ path: path.join(outDir, 'portal-boletim.png'), fullPage: true });
    const boletimVisible = await page.getByRole('heading', { name: 'Boletim' }).isVisible({ timeout: 10_000 });
    report.portal.boletim = {
      ok: boletimVisible,
      cause: boletimVisible ? null : 'boletim não renderizado',
    };
  } catch (error) {
    const cause = error instanceof Error ? error.message : String(error);
    if (!report.portal.login.ok) report.portal.login.cause = cause;
    if (!report.portal.painel.ok) report.portal.painel.cause = cause;
    if (!report.portal.boletim.ok) report.portal.boletim.cause = cause;
  }
}

function slug(value: string): string {
  const clean = value === '/' ? 'home' : value;
  return clean
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function url(route: string): string {
  if (route.startsWith('http://') || route.startsWith('https://')) return route;
  return `${frontUrl}${route.startsWith('/') ? route : `/${route}`}`;
}
