# educari-2027-front

Frontend (Next.js + TypeScript) do Educari — SaaS multi-tenant de Sistema de Gestão Educacional.

> ⚠️ **Para LLMs:** leia [`AGENTS.md`](AGENTS.md) ANTES de qualquer ação.

## Repositórios relacionados

- **Backend (API Laravel):** [educari-2027-infra](https://github.com/fabiotgk/educari-2027-infra)
  - Blueprint funcional completo, 20 ADRs, conventions, workflows
  - **Fonte primária da verdade** sobre arquitetura

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (componentes copiados, não dependency)
- **TanStack Query v5** (server state) + **Zustand** (UI local)
- **next-auth v5** (OAuth client → Laravel Passport)
- **framer-motion** (animação leve)
- **next-intl** (PT-BR + glossary por tenant)
- **React Hook Form + Zod** (formulários tipados)
- **Vitest + Testing Library** (testes)

## Como rodar

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

A app sobe com **mock data** até a API estar conectada.

## Scripts

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier (write)
pnpm format:check # Prettier (check)
pnpm test         # Vitest
pnpm ci           # tudo acima
```

## Estrutura

```
src/
├── app/
│   ├── layout.tsx              # root (providers, font, metadata)
│   ├── (admin)/                # dashboard autenticado
│   ├── (auth)/                 # login (a criar)
│   ├── (public)/               # portal público (a criar)
│   └── api/                    # Route Handlers
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── dashboard/              # sidebar, topbar, cards, feed
│   └── modules/                # componentes por M##
├── lib/
│   ├── providers/              # TenantProvider, QueryProvider
│   ├── format.ts               # formatters PT-BR
│   └── utils.ts                # cn()
├── data/
│   ├── modules.ts              # catálogo M01-M38
│   └── mock.ts                 # mock até integrar API
├── types/                      # tipos TS (espelham backend)
└── i18n/                       # PT-BR + glossary
```

## Multi-tenancy

Cada tenant tem seu próprio:
- **Theme** (logo, cores, fontes) — aplicado via CSS variables no `TenantProvider`
- **Feature flags** (M01-M38 ativáveis por contrato)
- **Glossary** (overrides PT-BR de terminologia)

Acesso via hook `useTenant()`:

```tsx
const { tenant, hasFeature, isModuleEnabled } = useTenant();

if (!isModuleEnabled('M03')) {
  return <ModuleNotEnabledMessage />;
}
```

## CI

CI valida em todo PR:
- Lint (ESLint + Prettier)
- TypeScript (`tsc --noEmit`)
- Build (`next build`)
- Vitest
- Security (gitleaks + pnpm audit)
- Commit conventions (Conventional Commits + Co-Author Ailiv)

## Convenções

- **PT-BR** em tudo voltado a humano (UI, commits, PRs, erros)
- **TypeScript strict** — sem `any`
- **Server Components por default;** `'use client'` quando necessário
- **shadcn/ui copy-paste** — não modificar diretamente
- Detalhes completos no [AGENTS.md do educari-2027-infra](https://github.com/fabiotgk/educari-2027-infra/blob/main/AGENTS.md)

## Licença

Proprietário — devnx.
