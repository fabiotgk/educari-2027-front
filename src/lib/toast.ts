'use client';

import { toast } from 'react-toastify';

import { ApiError } from '@/lib/api-client';

/**
 * Wrappers de toast (react-toastify) com texto PT-BR. O `<ToastContainer/>`
 * é montado em src/app/layout.tsx.
 */

export function toastSuccess(message: string): void {
  toast.success(message);
}

export function toastInfo(message: string): void {
  toast.info(message);
}

/**
 * Mostra um erro de forma amigável. Para ApiError de validação (422),
 * mostra a primeira mensagem por campo; os erros por campo devem ser
 * aplicados ao formulário via applyApiErrors (ver lib/form.ts).
 */
export function toastError(error: unknown, fallback = 'Algo deu errado. Tente novamente.'): void {
  if (error instanceof ApiError) {
    if (error.isValidation) {
      const first = Object.values(error.errors)[0]?.[0];
      toast.error(first ?? error.message ?? 'Verifique os campos destacados.');
      return;
    }
    toast.error(error.message || fallback);
    return;
  }
  toast.error(error instanceof Error ? error.message : fallback);
}

export { toast };
