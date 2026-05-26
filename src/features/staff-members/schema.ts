import { z } from 'zod';

import { unmask } from '@/lib/masks';
import type { StaffMember } from './types';

/**
 * Schema do formulário de Servidor. Os nomes espelham o
 * CreateStaffMemberRequest do backend para mapeamento correto de erros 422.
 */
export const staffMemberSchema = z.object({
  user_id: z.string().uuid('UUID inválido.').optional().or(z.literal('')),
  name: z.string().min(1, 'O nome do servidor é obrigatório.').max(255),
  cpf: z
    .string()
    .regex(/^\d{11}$/, 'O CPF deve ter 11 dígitos.')
    .optional()
    .or(z.literal('')),
  registration_number: z.string().max(32).optional(),
  role_title: z.string().max(128).optional(),
  admission_date: z.string().optional(),
  status: z.string().max(16).optional(),
});

export type StaffMemberFormValues = z.infer<typeof staffMemberSchema>;

export const emptyStaffMemberForm: StaffMemberFormValues = {
  user_id: '',
  name: '',
  cpf: '',
  registration_number: '',
  role_title: '',
  admission_date: '',
  status: 'active',
};

export function staffMemberToForm(s: StaffMember): StaffMemberFormValues {
  return {
    user_id: s.user_id ?? '',
    name: s.name,
    cpf: s.cpf ? unmask(s.cpf) : '',
    registration_number: s.registration_number ?? '',
    role_title: s.role_title ?? '',
    admission_date: s.admission_date ? s.admission_date.slice(0, 10) : '',
    status: s.status ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function buildStaffMemberPayload(v: StaffMemberFormValues): Record<string, unknown> {
  return {
    user_id: blank(v.user_id),
    name: v.name.trim(),
    cpf: blank(v.cpf),
    registration_number: blank(v.registration_number),
    role_title: blank(v.role_title),
    admission_date: blank(v.admission_date),
    status: blank(v.status),
  };
}
