import { z } from 'zod';
import type { QuestionBank } from './types';

/**
 * Schema do formulário de Banco de Questões. Os nomes dos campos espelham o
 * CreateQuestionBankRequest do backend.
 */
export const questionBankSchema = z.object({
  name: z.string().min(1, 'O nome do banco de questões é obrigatório.').max(255),
  subject_id: z.string().uuid('UUID da disciplina inválido.').optional().or(z.literal('')),
  description: z.string().optional(),
});

export type QuestionBankFormValues = z.infer<typeof questionBankSchema>;

export const emptyQuestionBankForm: QuestionBankFormValues = {
  name: '',
  subject_id: '',
  description: '',
};

export function questionBankToForm(b: QuestionBank): QuestionBankFormValues {
  return {
    name: b.name,
    subject_id: b.subject_id ?? '',
    description: b.description ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function buildQuestionBankPayload(v: QuestionBankFormValues): Record<string, unknown> {
  return {
    name: v.name.trim(),
    subject_id: blank(v.subject_id),
    description: blank(v.description),
  };
}
