import { z } from 'zod';

import type { LearningPath } from './types';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
const STATUSES = ['active', 'paused', 'completed'] as const;

/**
 * Schema do formulário de Trilha de aprendizagem. Os nomes dos campos espelham o
 * CreateLearningPathRequest / UpdateLearningPathRequest do backend,
 * para que os erros 422 mapeiem direto nos campos via applyApiErrors.
 */
export const learningPathSchema = z.object({
  title: z.string().min(1, 'O título da trilha é obrigatório.').max(255, 'O título não pode exceder 255 caracteres.'),
  student_id: z.string().uuid('O identificador do aluno deve ser um UUID válido.').optional().or(z.literal('')),
  subject_id: z.string().uuid('O identificador da disciplina deve ser um UUID válido.').optional().or(z.literal('')),
  current_level: z.string().max(64, 'O nível atual não pode exceder 64 caracteres.').optional().or(z.literal('')),
  difficulty: z.enum(DIFFICULTIES, { message: 'A dificuldade informada é inválida.' }).optional().or(z.literal('')),
  items: z.string().optional().or(z.literal('')),
  progress_pct: z
    .string()
    .refine((v) => {
      if (v === '' || v === undefined) return true;
      const n = Number(v);
      return !Number.isNaN(n) && n >= 0 && n <= 100;
    }, 'O progresso deve ser um número entre 0 e 100.')
    .optional()
    .or(z.literal('')),
  status: z.enum(STATUSES, { message: 'O status informado é inválido.' }).optional().or(z.literal('')),
});

export type LearningPathFormValues = z.infer<typeof learningPathSchema>;

/** Valores iniciais para criação. */
export const emptyLearningPathForm: LearningPathFormValues = {
  title: '',
  student_id: '',
  subject_id: '',
  current_level: '',
  difficulty: '',
  items: '',
  progress_pct: '',
  status: '',
};

/** Converte um LearningPath (API) nos valores do formulário (para edição). */
export function learningPathToForm(lp: LearningPath): LearningPathFormValues {
  return {
    title: lp.title,
    student_id: lp.student_id ?? '',
    subject_id: lp.subject_id ?? '',
    current_level: lp.current_level ?? '',
    difficulty: lp.difficulty ?? '',
    items: lp.items && Array.isArray(lp.items) ? JSON.stringify(lp.items, null, 2) : '',
    progress_pct: lp.progress_pct != null ? String(lp.progress_pct) : '',
    status: lp.status ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios e convertendo tipos. */
export function buildLearningPathPayload(v: LearningPathFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: v.title.trim(),
  };

  const studentId = blank(v.student_id);
  if (studentId) payload.student_id = studentId;

  const subjectId = blank(v.subject_id);
  if (subjectId) payload.subject_id = subjectId;

  const currentLevel = blank(v.current_level);
  if (currentLevel) payload.current_level = currentLevel;

  const difficulty = blank(v.difficulty);
  if (difficulty) payload.difficulty = difficulty;

  const progressPct = blank(v.progress_pct);
  if (progressPct !== undefined) {
    payload.progress_pct = Number(progressPct);
  }

  const status = blank(v.status);
  if (status) payload.status = status;

  const itemsRaw = blank(v.items);
  if (itemsRaw !== undefined) {
    try {
      payload.items = JSON.parse(itemsRaw);
    } catch {
      // Se o JSON for inválido, envia como string e deixa o backend validar
      payload.items = itemsRaw;
    }
  }

  return payload;
}
