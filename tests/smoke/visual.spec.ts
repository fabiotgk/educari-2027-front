import { test, type Page } from '@playwright/test';
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

test('smoke visual Educari', async ({ page }) => {
  fs.mkdirSync(outDir, { recursive: true });

  const adminToken = process.env.EDUCARI_ADMIN_TOKEN;
  if (!adminToken) throw new Error('EDUCARI_ADMIN_TOKEN não informado.');

  await page.addInitScript(({ token }) => {
    window.localStorage.setItem('educari_token', token);
    window.localStorage.setItem(
      'educari_user',
      JSON.stringify({
        id: 'smoke-admin',
        name: 'Smoke Admin',
        email: 'admin@mariana.mg.gov.br',
        roles: ['tenant.super_admin'],
        tenant: { slug: 'mariana', name: 'Prefeitura Municipal de Mariana' },
      }),
    );
    document.cookie = `educari_token=${token}; path=/; max-age=86400; samesite=lax`;
  }, { token: adminToken });

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
      const response = await page.goto(url(route), { waitUntil: 'domcontentloaded', timeout: 20_000 });
      status = response?.status() ?? null;
      if (status === null || status >= 400) cause = `status ${status ?? 'sem resposta'}`;
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
    await page.goto(url('/ava'), { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
    const firstCourse = page.locator('tbody a[href^="/ava/"]').filter({ hasText: /.+/ }).first();
    const href = await firstCourse.getAttribute('href', { timeout: 10_000 });
    if (!href) throw new Error('nenhum link de curso encontrado na tabela');

    await page.goto(url(href), { waitUntil: 'domcontentloaded', timeout: 20_000 });
    await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
    await page.screenshot({ path: path.join(outDir, 'ava-detalhe.png'), fullPage: true });

    for (const tab of Object.keys(report.avaTabs)) {
      await page.getByRole('tab', { name: tab }).click();
      await page.waitForLoadState('networkidle', { timeout: 2_000 }).catch(() => {});
      const activePanel = page.locator('[role="tabpanel"][data-state="active"]');
      const rows = await activePanel.locator('tbody tr').count();
      const cards = await activePanel.locator('[class*="rounded-xl"], [class*="rounded-lg"]').count();
      const count = rows || cards;
      report.avaTabs[tab] = {
        ok: rows > 0,
        count,
        cause: rows > 0 ? null : 'conteúdo sem linhas na tabela',
      };
      await page.screenshot({ path: path.join(outDir, `ava-${slug(tab)}.png`), fullPage: true });
    }
  } catch (error) {
    for (const tab of Object.keys(report.avaTabs)) {
      report.avaTabs[tab].cause = error instanceof Error ? error.message : String(error);
    }
  }
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
