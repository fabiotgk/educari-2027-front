import { z } from 'zod';
import type { DocumentTemplate } from './types';

const DOCUMENT_KINDS = [
  'boletim',
  'historico',
  'declaracao_matricula',
  'declaracao_frequencia',
  'declaracao_transferencia',
  'certificado_conclusao',
  'ficha_individual',
] as const;

/**
 * Schema do formulário de Template de Documento. Os nomes espelham
 * CreateDocumentTemplateRequest do backend.
 */
export const documentTemplateSchema = z.object({
  kind: z.enum(DOCUMENT_KINDS, { error: 'Selecione o tipo de documento.' }),
  name: z.string().min(1, 'O nome do template é obrigatório.').max(255),
  header_html: z.string().optional(),
  footer_html: z.string().optional(),
  body_template: z.string().min(1, 'O conteúdo do template é obrigatório.'),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type DocumentTemplateFormValues = z.infer<typeof documentTemplateSchema>;

/** Valores iniciais para criação. */
export const emptyDocumentTemplateForm: DocumentTemplateFormValues = {
  kind: 'declaracao_matricula',
  name: '',
  header_html: '',
  footer_html: '',
  body_template: '',
  is_default: false,
  is_active: true,
};

/** Converte um DocumentTemplate (API) nos valores do formulário (para edição). */
export function documentTemplateToForm(t: DocumentTemplate): DocumentTemplateFormValues {
  return {
    kind: t.kind,
    name: t.name,
    header_html: t.header_html ?? '',
    footer_html: t.footer_html ?? '',
    body_template: t.body_template,
    is_default: t.is_default,
    is_active: t.is_active,
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API. */
export function buildDocumentTemplatePayload(
  v: DocumentTemplateFormValues,
): Record<string, unknown> {
  return {
    kind: v.kind,
    name: v.name.trim(),
    header_html: blank(v.header_html),
    footer_html: blank(v.footer_html),
    body_template: v.body_template.trim(),
    is_default: v.is_default,
    is_active: v.is_active,
  };
}
