import { z } from 'zod';

import type { Site } from './types';

const SITE_OWNER_TYPES = ['tenant', 'school', 'project'] as const;

/**
 * Schema do formulário de Site.
 * Os nomes dos campos espelham o CreateSiteRequest do backend.
 */
export const siteSchema = z.object({
  slug: z
    .string()
    .min(1, 'O identificador (slug) é obrigatório.')
    .max(128)
    .regex(/^[a-z0-9-]+$/, 'O slug deve conter apenas letras minúsculas, números e hífens.'),
  name: z.string().min(1, 'O nome do site é obrigatório.').max(255),
  owner_type: z.enum(SITE_OWNER_TYPES).optional().or(z.literal('')),
  owner_id: z.string().max(36).optional(),
  subdomain: z.string().max(128).optional(),
  custom_domain: z.string().max(255).optional(),
  description: z.string().optional(),
  is_published: z.boolean().optional(),
  published_at: z.string().optional(),
});

export type SiteFormValues = z.infer<typeof siteSchema>;

/** Valores iniciais para criação. */
export const emptySiteForm: SiteFormValues = {
  slug: '',
  name: '',
  owner_type: '',
  owner_id: '',
  subdomain: '',
  custom_domain: '',
  description: '',
  is_published: false,
  published_at: '',
};

/** Converte um Site (API) nos valores do formulário (para edição). */
export function siteToForm(s: Site): SiteFormValues {
  return {
    slug: s.slug,
    name: s.name,
    owner_type: s.owner_type ?? '',
    owner_id: s.owner_id ?? '',
    subdomain: s.subdomain ?? '',
    custom_domain: s.custom_domain ?? '',
    description: s.description ?? '',
    is_published: s.is_published ?? false,
    published_at: s.published_at ? s.published_at.slice(0, 10) : '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios. */
export function buildSitePayload(v: SiteFormValues): Record<string, unknown> {
  return {
    slug: v.slug.trim(),
    name: v.name.trim(),
    owner_type: blank(v.owner_type as string | undefined),
    owner_id: blank(v.owner_id),
    subdomain: blank(v.subdomain),
    custom_domain: blank(v.custom_domain),
    description: blank(v.description),
    is_published: v.is_published,
    published_at: blank(v.published_at),
  };
}
