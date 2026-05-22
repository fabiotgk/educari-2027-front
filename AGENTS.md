<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next.js 16) has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — Instruções para LLMs no educari-2027-front

> **VOCÊ É UMA LLM CONTRIBUINDO PARA O educari-2027-front.**
>
> Este é o **frontend** (Next.js + TypeScript) que consome a API
> Laravel em **educari-2027-infra**.
>
> A **fonte primária de verdade** sobre arquitetura, convenções
> inegociáveis e fluxos é o `AGENTS.md` do **educari-2027-infra**
> ([github.com/fabiotgk/educari-2027-infra](https://github.com/fabiotgk/educari-2027-infra)).
>
> Leia este arquivo + o AGENTS.md do infra antes de qualquer ação.

---

## Resumo do projeto

- **Repositório:** educari-2027-front
- **Stack:** Next.js 16 (App Router, Turbopack) + React 19 + TypeScript 5
- **Estilo:** Tailwind CSS 4 + shadcn/ui (componentes copiados em `src/components/ui/`)
- **Estado:** TanStack Query (server) + Zustand (UI local)
- **Auth:** next-auth v5 (OAuth client) consumindo Laravel Passport do infra
- **Animação:** framer-motion (usar com parcimônia)
- **i18n:** PT-BR fixo + glossary configurável por tenant via API
- **Formulários:** React Hook Form + Zod
- **Testes:** Vitest + Testing Library

## Backend (educari-2027-infra)

API REST versionada (`/api/v1/...`) em Laravel 11+. Resolução de
tenant por subdomínio (`*.educari.com.br`).

Tipos da API são gerados a partir de `openapi.yaml` publicado pelo
backend. Quando o pipeline estiver configurado, os tipos vão para
`src/types/api.d.ts`.

---

## Regras inegociáveis (resumo — completo no AGENTS.md do infra)

1. **PT-BR** em tudo voltado a humano: commits, PRs, mensagens de UI,
   labels, copy, errors mostrados ao usuário. Identificadores técnicos
   (componentes, hooks, funções) em inglês.
2. **Co-Author obrigatório em commits:**
   `Co-Authored-By: Ailiv <naoresponda@ailiv.com.br>` — **nunca**
   Claude/GPT/Cursor/Cline/Llama/Kimi.
3. **Conventional Commits** com escopo (`m##`, `auth`, `ui`, etc.).
4. **Multi-tenancy ciente:** todo componente que consome dados deve
   considerar o `tenant` atual via `useTenant()` hook. Feature flags
   via `useTenant().hasFeature(key)` ou `isModuleEnabled(code)`.
5. **Sem hard-coded por tenant** (`if (slug === 'mariana')`) — use
   feature flags + theme + glossary.
6. **TypeScript strict.** Sem `any`. `unknown` + narrowing.
7. **Server Components por default;** `'use client'` apenas quando
   necessário (interatividade, hooks de cliente).
8. **shadcn/ui** copiado em `src/components/ui/` — não modificar
   diretamente sem documentar. Customização via Tailwind class
   composition ou novo componente em `src/components/shared/`.

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx              # root layout (providers, font, metadata)
│   ├── globals.css             # Tailwind + CSS vars do tenant
│   ├── (admin)/                # área autenticada do dashboard
│   │   ├── layout.tsx          # sidebar persistente
│   │   ├── page.tsx            # / — Visão Geral
│   │   ├── matriculas/         # M03
│   │   ├── notas/              # M07
│   │   ├── ...                 # outros módulos M##
│   │   └── configuracoes/
│   ├── (auth)/                 # login, recuperação de senha (a criar)
│   │   └── login/page.tsx
│   ├── (public)/               # área pública (portal de matrícula, boletim aberto)
│   │   └── inscricao/          # M02 portal público
│   └── api/                    # Route Handlers (auth callback, webhook, etc.)
│       └── auth/[...nextauth]/route.ts
├── components/
│   ├── ui/                     # shadcn/ui — copy-paste, não dependency
│   ├── dashboard/              # componentes específicos do dashboard
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── metric-card.tsx
│   │   ├── activity-feed.tsx
│   │   └── quick-actions.tsx
│   ├── shared/                 # componentes reusáveis cross-feature
│   └── modules/                # componentes por módulo M##
│       ├── m03-enrollment/
│       └── ...
├── lib/
│   ├── providers/
│   │   ├── tenant-provider.tsx # contexto tenant + theme dinâmico
│   │   └── query-provider.tsx  # TanStack Query
│   ├── api-client.ts           # cliente HTTP tipado (criar quando integrar)
│   ├── format.ts               # formatters PT-BR (CPF, CNPJ, datas, moeda)
│   ├── utils.ts                # cn() (clsx + tailwind-merge)
│   └── auth.ts                 # next-auth config
├── hooks/
├── types/
│   ├── tenant.ts               # tipos do tenant (espelham backend)
│   └── api.d.ts                # gerado do OpenAPI (quando disponível)
├── data/
│   ├── modules.ts              # catálogo dos 38 módulos M01-M38
│   └── mock.ts                 # mock data até integrar com backend
└── i18n/                       # next-intl messages PT-BR
```

---

## Fluxo padrão para qualquer tarefa

```
[1] Ler AGENTS.md do infra (regras inegociáveis)
[2] Identificar módulo M## e tipo de tarefa
[3] Consultar docs/conventions/ no infra:
    - code-style.md (Frontend section)
    - naming.md
    - testing.md
[4] Implementar seguindo:
    - Server Component por default
    - shadcn/ui para primitives, framer-motion com parcimônia
    - Tipagem rigorosa (sem any)
    - useTenant() para acesso ao tenant atual
    - feature flag check antes de renderizar módulo
    - TanStack Query para fetch (React Query v5)
[5] Validar local: pnpm lint && pnpm typecheck && pnpm build
[6] Commit (Conventional Commits + Co-Author Ailiv)
[7] PR com template, labels (type/size/module/risk)
```

---

## Defaults de design

| Item | Default |
|---|---|
| **Linguagem da UI** | PT-BR (sem exceção) |
| **Fuso de exibição** | GMT-3 (Brasília) — `lib/format.ts` |
| **Formato de data** | `dd/MM/yyyy` |
| **Formato de hora** | `HH:mm` |
| **Formato de número** | `1.234,56` |
| **Tema** | CSS Variables aplicadas pelo TenantProvider |
| **Cor primária** | `var(--tenant-primary)` — vem do theme do tenant |
| **Cor accent** | `var(--tenant-accent)` |
| **Tipografia** | Inter (configurável por tenant via `font_family`) |
| **Acessibilidade** | WCAG 2.1 AA mínimo (contraste, ARIA, foco) |
| **Componentes** | shadcn/ui em `src/components/ui/` |
| **Ícones** | lucide-react |
| **Animação** | framer-motion (motion.div) — usar pouco |
| **Toast** | sonner |
| **Forms** | React Hook Form + Zod schema |

---

## Como rodar localmente

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
pnpm lint
pnpm typecheck
pnpm test     # Vitest
```

Hoje a app roda com **MOCK_TENANT** (em `src/data/mock.ts`). Quando
o backend `educari-2027-infra` estiver respondendo:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://mariana.educari.test:3000
NEXTAUTH_SECRET=<generate>
```

O `src/app/layout.tsx` substituirá `MOCK_TENANT` por fetch da API.

---

## CI (`.github/workflows/ci.yml`)

CI valida:
- Lint (ESLint + Prettier)
- Type check (`tsc --noEmit`)
- Build (`next build`)
- Vitest (unit + integration)
- Playwright (e2e — quando configurado)
- Commitlint
- Co-Author Ailiv presente

**Sem CI verde, sem auto-merge.**

---

## Para outras LLMs continuarem

Próximos passos sugeridos quando você for o próximo a contribuir:

1. **Conectar com a API** (`src/lib/api-client.ts`):
   - GET `/api/v1/tenant/config` substitui `MOCK_TENANT`
   - next-auth callback recebe token do Passport
2. **Implementar tela de login** em `src/app/(auth)/login/page.tsx`
3. **Implementar módulo M01** (Cadastros) — primeiro módulo real
4. **Adicionar Playwright** com cenário "login → dashboard → ver módulo"
5. **Tela de configurações de tenant** (apenas admin SME)

---

## Referências

- **AGENTS.md do educari-2027-infra:** https://github.com/fabiotgk/educari-2027-infra/blob/main/AGENTS.md
- **EDUCARI-SPEC.md** (blueprint funcional): no repo do infra
- **ADRs:** `docs/adr/` no repo do infra
- **Conventions:** `docs/conventions/` no repo do infra
- **Workflows:** `docs/workflows/` no repo do infra
