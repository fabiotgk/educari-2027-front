import { z } from 'zod';

import type { Student } from './types';

const GENDERS = ['male', 'female', 'non_binary', 'prefer_not_say'] as const;
const RACES = ['branca', 'parda', 'preta', 'amarela', 'indigena', 'nao_declarada'] as const;

/**
 * Schema do formulário de Aluno. Os nomes dos campos espelham o
 * CreateStudentRequest do backend, para que os erros 422 mapeiem
 * direto nos campos via applyApiErrors.
 */
export const studentSchema = z.object({
  full_name: z.string().min(1, 'O nome completo é obrigatório.').max(255),
  social_name: z.string().max(255).optional().or(z.literal('')),
  birth_date: z
    .string()
    .min(1, 'A data de nascimento é obrigatória.')
    .refine(
      (v) => {
        const d = new Date(v);
        return !isNaN(d.getTime()) && d <= new Date(new Date().toDateString());
      },
      { message: 'A data de nascimento não pode ser futura.' },
    ),
  birth_certificate_number: z.string().max(64).optional().or(z.literal('')),
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'O CPF deve ter 11 dígitos.')
    .optional()
    .or(z.literal('')),
  rg: z.string().max(20).optional().or(z.literal('')),
  rg_issuer: z.string().max(32).optional().or(z.literal('')),
  nis: z
    .string()
    .regex(/^\d{11}$/, 'O NIS deve ter 11 dígitos.')
    .optional()
    .or(z.literal('')),
  gender: z.enum(GENDERS).optional().or(z.literal('')),
  race: z.enum(RACES).optional().or(z.literal('')),
  nationality: z.string().max(64).optional().or(z.literal('')),
  birth_state: z.string().max(2).optional().or(z.literal('')),
  birth_city: z.string().max(128).optional().or(z.literal('')),
  photo_url: z.string().url('URL inválida.').max(512).optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

/** Valores iniciais para criação. */
export const emptyStudentForm: StudentFormValues = {
  full_name: '',
  social_name: '',
  birth_date: '',
  birth_certificate_number: '',
  cpf: '',
  rg: '',
  rg_issuer: '',
  nis: '',
  gender: '',
  race: '',
  nationality: '',
  birth_state: '',
  birth_city: '',
  photo_url: '',
  notes: '',
};

/** Converte um Student (API) nos valores do formulário (para edição). */
export function studentToForm(s: Student): StudentFormValues {
  return {
    full_name: s.full_name,
    social_name: s.social_name ?? '',
    birth_date: s.birth_date ?? '',
    birth_certificate_number: s.birth_certificate_number ?? '',
    cpf: s.cpf ?? '',
    rg: s.rg ?? '',
    rg_issuer: s.rg_issuer ?? '',
    nis: s.nis ?? '',
    gender: s.gender ?? '',
    race: s.race ?? '',
    nationality: s.nationality ?? '',
    birth_state: s.birth_state ?? '',
    birth_city: s.birth_city ?? '',
    photo_url: s.photo_url ?? '',
    notes: s.notes ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

/** Monta o payload para a API, omitindo vazios. */
export function buildStudentPayload(v: StudentFormValues): Record<string, unknown> {
  return {
    full_name: v.full_name.trim(),
    social_name: blank(v.social_name),
    birth_date: v.birth_date,
    birth_certificate_number: blank(v.birth_certificate_number),
    cpf: blank(v.cpf),
    rg: blank(v.rg),
    rg_issuer: blank(v.rg_issuer),
    nis: blank(v.nis),
    gender: blank(v.gender),
    race: blank(v.race),
    nationality: blank(v.nationality),
    birth_state: blank(v.birth_state)?.toUpperCase(),
    birth_city: blank(v.birth_city),
    photo_url: blank(v.photo_url),
    notes: blank(v.notes),
  };
}
