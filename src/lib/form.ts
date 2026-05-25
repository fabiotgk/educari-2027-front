'use client';

import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/lib/api-client';

/**
 * Aplica os erros de validação 422 do backend nos campos do formulário
 * (react-hook-form). As chaves do backend seguem o mesmo nome dos campos
 * (inclusive aninhados como `address.cep`), então o mapeamento é direto.
 *
 * Retorna true se aplicou ao menos um erro de campo (útil para decidir
 * se ainda mostra um toast genérico).
 */
export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): boolean {
  if (!(error instanceof ApiError) || !error.isValidation) return false;

  let applied = false;
  for (const [field, messages] of Object.entries(error.errors)) {
    if (messages?.length) {
      setError(field as Path<T>, { type: 'server', message: messages[0] });
      applied = true;
    }
  }
  return applied;
}
