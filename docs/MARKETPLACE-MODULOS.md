# Marketplace de Módulos — desenho

> Painel onde o **admin da prefeitura** habilita os módulos que a prefeitura
> tem. Catálogo dos 38 módulos organizado por **Categoria → Subcategoria**.
> Pluga no mecanismo de feature flags que **já existe** (não começa do zero).

## Já existe (reaproveitar)
- Tabela **`tenant_feature_flags`**: `tenant_id`, `feature_key`, `enabled`,
  `enabled_at`, **`contract_starts_at`**, **`contract_ends_at`**, `config` (jsonb).
- Catálogo **`config/tenant-features.php`** (`feature_key => { name, default }`).
- Front: `tenant.feature_flags`, `hasFeature(key)`, `isModuleEnabled(code)` —
  a sidebar já reage e marca "não contratado".

## Modelo: dois níveis (decidido)
1. **Educari (plataforma)** contrata módulos para a prefeitura, com vigência
   (`contract_starts_at`/`ends_at`). Define o que a prefeitura **pode** ter.
2. **Admin da prefeitura** liga/desliga, no marketplace, só os **contratados**.

### 3 estados por módulo (por tenant)
- 🟢 **Contratado** — flag existe e dentro da vigência → admin liga/desliga
  (`enabled`). Exibe vigência quando houver `contract_ends_at`.
- 🔒 **Disponível para contratar** — sem contrato (ou expirado) → card com
  cadeado + "Solicitar contratação"; toggle bloqueado.
- 🔜 **Em breve** — módulo sem backend pronto (`status: coming_soon`) → selo
  "Em breve", toggle desabilitado (independe de contrato).

## Taxonomia (categoria → subcategoria → módulos)
- **Pedagógico** → Matrícula & Cadastro (M01, M02, M03) · Sala de aula
  (M04, M05, M06, M07) · Secretaria escolar (M08, M09)
- **Comunicação & Portais** → Portais (M10, M12) · Comunicação (M11) · Apps (M13, M14)
- **Compliance** → EDUCACENSO (M18) · Evasão (M19) · Auditoria (M26)
- **Gestão de Pessoas** → Magistério (M15, M16, M17, M33)
- **Administrativo & Logística** → Alimentação (M21, M36) · Financeiro (M22) ·
  Patrimônio/Materiais (M23, M24, M25) · Transporte (M20) · Infra/Suporte (M27, M30)
- **Avaliação & IA** → Banco de Questões (M34) · IA Textual (M29) ·
  Ensino Adaptativo (M32) · Reconhecimento Facial (M28)
- **EAD & Expansão** → AVA/LMS (M31) · Polos (M35) · Cursos Livres (M38)
- **Educação Especial** → AEE (M37)

## O que falta construir
### Backend
1. Estender `config/tenant-features.php`: completar os 38 módulos, cada um com
   `name`, `description`, `category`, `subcategory`, `default`, `status`
   (`available` | `coming_soon`), `icon`, opcional `depends_on`.
2. `GET /api/v1/modules/catalog` — catálogo (config) **mesclado** com os flags
   do tenant (enabled, contratado?, vigência) → o marketplace recebe tudo numa chamada.
3. `PATCH /api/v1/tenant-modules/{feature_key}` — liga/desliga `enabled`
   (só se contratado **e** `status: available`). Permissão `tenant.modules.manage`
   (super_admin do tenant).
4. (Contratação é nível-plataforma — Educari super-admin. Para a demo: semear
   alguns módulos contratados no tenant Mariana.)

### Frontend (segue o CRUD-PATTERN: página inteira, largura total, cursor pointer)
1. `features/marketplace/` — catálogo por categoria→subcategoria, cards com
   selo de estado + toggle. Hooks `useModuleCatalog()` + `useToggleModule()`.
2. Rota `/configuracoes/modulos`.
3. Ao alternar, invalidar a config do tenant → sidebar/rotas reagem na hora.

## Em aberto
- Dependências entre módulos (ex.: M03 precisa de M01) — avisar/forçar ao habilitar?
- Tela de contratação (nível Educari) — fora do MVP do marketplace do admin.
