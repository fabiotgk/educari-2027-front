import { z } from 'zod';

import type { LibraryItem } from './types';

const LIBRARY_ITEM_KINDS = ['book', 'magazine', 'dvd', 'other'] as const;

/**
 * Schema do formulário de Item de Biblioteca. Os nomes dos campos espelham o
 * CreateLibraryItemRequest do backend para que os erros 422 mapeiem
 * direto nos campos via applyApiErrors.
 */
export const libraryItemSchema = z.object({
  library_id: z.string().uuid('Selecione uma biblioteca válida.'),
  kind: z.enum(LIBRARY_ITEM_KINDS, { error: 'Selecione o tipo do item.' }),
  title: z.string().min(1, 'O título do item é obrigatório.').max(255),
  author: z.string().max(255).optional().or(z.literal('')),
  isbn: z.string().max(20).optional().or(z.literal('')),
  publisher: z.string().max(128).optional().or(z.literal('')),
  published_year: z
    .string()
    .regex(/^\d{4}$/, 'O ano deve ter 4 dígitos.')
    .optional()
    .or(z.literal('')),
  shelf_code: z.string().max(32).optional().or(z.literal('')),
  copies_total: z.number().int().min(1, 'Informe ao menos 1 cópia.'),
  copies_available: z.number().int().min(0, 'O número de cópias disponíveis não pode ser negativo.'),
});

export type LibraryItemFormValues = z.infer<typeof libraryItemSchema>;

/** Valores iniciais para criação. */
export const emptyLibraryItemForm: LibraryItemFormValues = {
  library_id: '',
  kind: 'book',
  title: '',
  author: '',
  isbn: '',
  publisher: '',
  published_year: '',
  shelf_code: '',
  copies_total: 1,
  copies_available: 1,
};

/** Converte um LibraryItem (API) nos valores do formulário (para edição). */
export function libraryItemToForm(item: LibraryItem): LibraryItemFormValues {
  return {
    library_id: item.library_id,
    kind: item.kind,
    title: item.title,
    author: item.author ?? '',
    isbn: item.isbn ?? '',
    publisher: item.publisher ?? '',
    published_year: item.published_year ?? '',
    shelf_code: item.shelf_code ?? '',
    copies_total: item.copies_total,
    copies_available: item.copies_available,
  };
}

const blank = (v: string | undefined) =>
  v && v.trim() !== '' ? v.trim() : undefined;

/** Monta o payload para a API, omitindo vazios. */
export function buildLibraryItemPayload(v: LibraryItemFormValues): Record<string, unknown> {
  return {
    library_id: v.library_id,
    kind: v.kind,
    title: v.title.trim(),
    author: blank(v.author),
    isbn: blank(v.isbn),
    publisher: blank(v.publisher),
    published_year: blank(v.published_year),
    shelf_code: blank(v.shelf_code),
    copies_total: v.copies_total,
    copies_available: v.copies_available,
  };
}
