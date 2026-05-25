# Padrão de Telas CRUD — Educari Front

> **Para a LLM que vai construir uma tela:** leia este documento inteiro e
> **siga o piloto `src/features/schools/` à risca**. Ele é o _gold standard_.
> Cada tela é **específica e completa**; a **UI é compartilhada**. **Não crie
> abstrações genéricas** (nada de `useList<T>` / `DataTable` genérico próprio):
> os hooks de dados, colunas, schema e formulário são escritos à mão por recurso.

---

## 0. Regra de ouro de navegação (LEIA PRIMEIRO)

- **CRUD são PÁGINAS INTEIRAS, nunca painel lateral (Sheet/drawer).**
  - Lista → `/<rota>`
  - Criar → `/<rota>/nova` (página inteira)
  - Detalhe → `/<rota>/[id]` (página inteira **com abas**)
  - Editar → `/<rota>/[id]/editar` (página inteira)
- **Só o EXCLUIR usa modal** (`ConfirmDialog`). Nada mais usa modal/drawer.
- **A tela de detalhe é rica e organizada em ABAS:** uma aba **Resumo**
  (dados básicos) + abas de **relacionamento** (ex.: escola → aba "Matrículas").

---

## 1. Princípios inegociáveis

1. **PT-BR** em tudo voltado ao humano (labels, títulos, mensagens, toasts).
   Identificadores técnicos (componentes, hooks, funções, tipos) em **inglês**.
2. **TypeScript strict, sem `any`.** Use `unknown` + narrowing quando preciso.
3. **Tela específica + UI compartilhada.** Reaproveite `components/crud`,
   `components/form`, `components/ui`. Hooks de dados, colunas, zod schema e
   form são **por recurso** (escritos à mão).
4. **Espelhe o backend.** Os nomes dos campos do formulário/payload são
   **idênticos** aos do `FormRequest` (inclusive aninhados como `address.cep`)
   — é isso que faz o erro 422 mapear direto no campo.
5. **Tela = mini-app completo:** listagem rica + páginas de criar/editar +
   detalhe em abas + cards de estatística + seleção múltipla + ações em massa
   + exportar CSV.
6. **Toast = `react-toastify`** (via `@/lib/toast`). Nunca outra lib.
7. **Largura total do container.** O conteúdo da página usa **todo o espaço
   disponível** — o wrapper é `<div className="space-y-6 p-6 lg:p-8">`
   (só padding). **NÃO** centralize com `container mx-auto max-w-...`. O layout
   já cuida do viewport: a sidebar tem altura fixa com scroll próprio e só a
   área de conteúdo (`<main className="flex-1 overflow-auto …">`) rola.
8. **Cursor pointer** em tudo que é clicável já é garantido por uma regra
   global em `globals.css` (Tailwind v4 tira o pointer dos `<button>`). Não
   precisa adicionar `cursor-pointer` por elemento — só não remova.
9. Valide: `pnpm typecheck` verde **e** teste real no navegador logado como
   **Administrador** (`admin@<tenant>` tem todas as permissões).

---

## 2. Como o backend responde (educari/api — Laravel + Sanctum)

- **Auth:** header `Authorization: Bearer <token>` (o api-client injeta).
  O tenant é resolvido automaticamente pelo token (não envie `tenant_id`).
- **Lista (`GET /api/v1/<recurso>`):** envelope
  `{ data: T[], meta: { next_cursor, prev_cursor, per_page, path } }`.
  **Paginação por cursor** (`?limit=50&cursor=...`) — não há "página N".
- **Recurso único (`GET/POST/PATCH .../{id}`):** vem embrulhado em
  `{ data: {...} }` — o api-client **já desembrulha** para você.
- **Filtros:** `?filter[campo]=valor`; busca textual `?filter[campo][contains]=texto`.
- **Erros de validação:** HTTP **422** `{ message, errors: { campo: ["..."] } }`.
- **Datas:** ISO 8601 (use os helpers de `@/lib/format`).
- **Máscaras x backend:** CPF/CNPJ/telefone → o backend quer **só dígitos**
  (o `MaskedInput` já guarda dígitos). **CEP** pode exigir formato (ver a
  regra do `FormRequest`; no piloto enviamos `00000-000`).

> **Onde achar a ficha do recurso no backend** (`/home/ftgk/Documentos/GitHub/educari/api`):
> - Rotas: `app/Modules/<Módulo>/routes/api.php`
> - Campos: `app/Modules/<Módulo>/Models/<Model>.php` (`$fillable` + `$casts`)
> - Validação: `app/Modules/<Módulo>/Http/Requests/V1/*Request.php` (`rules()`)
> - Saída JSON: `app/Modules/<Módulo>/Http/Resources/V1/*Resource.php` (`toArray`)
> - **Relacionamentos com endpoint:** procure controllers que filtram por
>   `<recurso>_id` (ex.: `enrollments` filtra `filter[school_id]`) — esses
>   viram **abas de relacionamento** no detalhe.

---

## 3. Infraestrutura disponível (NÃO reescrever)

### `@/lib/api-client`
- `listResource<T>(recurso, params)` → `Promise<Paginated<T>>`
- `getResource<T>(recurso, id)` · `createResource<T>(recurso, body)` ·
  `updateResource<T>(recurso, id, body)` · `deleteResource(recurso, id)`
- `ApiError` (`.status`, `.errors`, `.isValidation`) · tipos `Paginated<T>`, `ListParams`

### `@/lib/toast` — `toastSuccess(msg)`, `toastError(err)` (trata ApiError)
### `@/lib/form` — `applyApiErrors(err, form.setError)` (mapeia 422 → campos)
### `@/lib/masks` — `maskCpf/maskCnpj/maskCep/maskPhone`, `unmask`
### `@/lib/format` — `formatDate/formatDateTime/formatCpf/formatCnpj/formatCurrency/...`

### `@/components/crud`
- `DataTable<T>` — tabela rica (props: `columns`, `rows`, `getRowId`, `loading`,
  `search`, `filters`, `bulkActions`, `onRowClick`, `exportFilename`,
  `emptyMessage`, `pager`). Tipo `Column<T>` exportado aqui.
- `PageHeader`, `StatCards` (`Stat`), `CursorPager`, `ConfirmDialog`,
  `DetailGrid` + `DetailField` (pares rótulo/valor nas páginas de detalhe).
- **NÃO existe FormSheet/DetailSheet** — CRUD é página inteira (ver §0).

### `@/components/form` — `Field` (label+erro), `MaskedInput`
### `@/components/ui` — button, input, label, select, checkbox, textarea, badge,
  **card**, **tabs**, etc.
### `@/components/dashboard/topbar` — `Topbar` (breadcrumbs)

---

## 4. Estrutura de uma feature (copie de `features/schools/`)

```
src/features/<resource>/
├── types.ts              # tipo do recurso (espelha o Resource) + label maps de enums
├── schema.ts             # zod schema + emptyForm + toForm(api) + buildPayload(form)
├── hooks.ts              # use<Resources>(params) + use<Resource>(id) + create/update/delete
├── columns.tsx           # buildColumns({onView,onEdit,onDelete}): Column<T>[] + badges
├── <resource>-form.tsx   # PÁGINA de criar/editar (Topbar + cards + rodapé). Aceita id? edita
├── <resource>-detail.tsx # PÁGINA de detalhe com ABAS (Resumo + relacionamentos + Auditoria)
├── <relacionamento>-tab.tsx # cada aba de relacionamento (fetch filtrado + mini-tabela)
└── <resource>-page.tsx   # LISTA: busca/filtros/cursor/cards + ConfirmDialog (delete)
```
Rotas (em `src/app/(admin)/<rota>/`):
```
<rota>/page.tsx              → <ResourcesPage/>            (lista)
<rota>/nova/page.tsx         → <ResourceFormPage/>         (criar)
<rota>/[id]/page.tsx         → await params → <ResourceDetailPage id=…/>
<rota>/[id]/editar/page.tsx  → await params → <ResourceFormPage resourceId=…/>
```
> No Next 16, `params` é `Promise` — faça `const { id } = await params;` na rota.
> A `<rota>` é o `href` do módulo em `src/data/modules.ts`.

---

## 5. Passo a passo (mapeamento backend → tela)

1. **types.ts** — para cada campo do `Resource::toArray`, um campo no `interface`.
   Enums viram união + `Record<…,string>` de labels PT-BR.
2. **schema.ts** — para cada regra do `*Request::rules()`, uma regra zod com
   **mesmo nome de campo** (aninhe `address`/`coordinates` como no backend).
   `emptyForm`, `toForm(api)` (edição) e `buildPayload(form)` (omite vazios,
   formata, converte números).
3. **hooks.ts** — `use<Resources>` (useQuery, `placeholderData: prev`),
   `use<Resource>(id)` (getResource), mutações com `invalidateQueries`.
4. **columns.tsx** — colunas com `cell`, `sortValue`, `exportValue`,
   `defaultHidden`, `pinned` (ações). Badges de status/enum coloridos.
5. **`<resource>-form.tsx`** — **página**: `Topbar` + cabeçalho com voltar +
   `Card`s de seção (`Field` + `Input`/`Select`/`MaskedInput` via `Controller`)
   + rodapé Cancelar/Salvar em **fluxo normal** (NÃO use `sticky`/`fixed` —
   gera scrollbar/lacuna extra; deixe-o após o conteúdo, dentro do `main` que
   rola). Aceita `resourceId?`; se houver, `use<Resource>`
   carrega e `form.reset(toForm(data))`. Submit: `buildPayload` → mutação →
   `toastSuccess` + `router.push` para o detalhe; catch: `applyApiErrors`
   (se nada aplicou, `toastError`).
6. **`<resource>-detail.tsx`** — **página com abas** (`Tabs`): aba **Resumo**
   (cards com `DetailGrid`/`DetailField`), abas de **relacionamento** (um
   `<…-tab.tsx>` cada), aba **Auditoria**. Cabeçalho com Editar (link p/
   `/[id]/editar`) e Excluir (`ConfirmDialog` → delete → `router.push` lista).
7. **`<relacionamento>-tab.tsx`** — `useQuery` com `listResource('<rel>', {
   filter: { <resource>_id: id } })`; loading (Skeleton), erro, vazio
   (estado vazio honesto), e mini-tabela com os dados.
8. **`<resource>-page.tsx`** — lista: estado de busca(debounce)/filtros/cursor/
   perPage, hook de lista, `StatCards`, `DataTable`, `ConfirmDialog`. Botões e
   ações **navegam** (`Link`/`router.push`) para `nova`/`[id]`/`[id]/editar`.

---

## 6. Checklist de "pronto" (obrigatório)

- [ ] `pnpm typecheck` → 0 erros · sem `any` · inglês nos identificadores, PT-BR nos textos
- [ ] **Criar/editar/detalhe são páginas próprias; só excluir é modal**
- [ ] Detalhe tem abas (Resumo + ao menos 1 relacionamento quando existir endpoint)
- [ ] Campos do form/payload com **mesmos nomes** do `FormRequest`
- [ ] Testado no navegador logado como **Administrador**:
      listar carrega dados reais · criar (página) salva e vai ao detalhe ·
      editar (página) salva · excluir (modal) some da lista · erro de validação
      aparece no campo · busca/filtros/ordenação/paginação/exportar funcionam ·
      abas do detalhe abrem sem erro
- [ ] Visual coerente com o piloto Escolas (mesmos componentes/estilo)

---

## 7. Gold standard — leia estes arquivos antes de começar

```
src/features/schools/types.ts
src/features/schools/schema.ts
src/features/schools/hooks.ts
src/features/schools/columns.tsx
src/features/schools/school-form.tsx       (página criar/editar)
src/features/schools/school-detail.tsx     (página detalhe com abas)
src/features/schools/enrollments-tab.tsx   (aba de relacionamento)
src/features/schools/schools-page.tsx      (lista)
src/app/(admin)/cadastros/page.tsx
src/app/(admin)/cadastros/nova/page.tsx
src/app/(admin)/cadastros/[id]/page.tsx
src/app/(admin)/cadastros/[id]/editar/page.tsx
```
Sua tela deve ser **estruturalmente idêntica** a essa, trocando apenas o
recurso, os campos e as regras. Em dúvida, faça igual ao piloto.
