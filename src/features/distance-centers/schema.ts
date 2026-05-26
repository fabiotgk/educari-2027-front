import { z } from 'zod';
import type { DistanceCenter } from './types';

/**
 * Schema do formulário de Polo EAD. Os nomes dos campos espelham o
 * CreateDistanceCenterRequest do backend.
 * capacity é mantido como string no form e convertido em buildPayload.
 */
export const distanceCenterSchema = z.object({
  name: z.string().min(1, 'O nome do polo é obrigatório.').max(255),
  location: z.string().max(255).optional(),
  capacity: z.string().optional(),
  coordinator_user_id: z
    .string()
    .uuid('UUID do coordenador inválido.')
    .optional()
    .or(z.literal('')),
});

export type DistanceCenterFormValues = z.infer<typeof distanceCenterSchema>;

export const emptyDistanceCenterForm: DistanceCenterFormValues = {
  name: '',
  location: '',
  capacity: '',
  coordinator_user_id: '',
};

export function distanceCenterToForm(c: DistanceCenter): DistanceCenterFormValues {
  return {
    name: c.name,
    location: c.location ?? '',
    capacity: c.capacity != null ? String(c.capacity) : '',
    coordinator_user_id: c.coordinator_user_id ?? '',
  };
}

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);

export function buildDistanceCenterPayload(
  v: DistanceCenterFormValues,
): Record<string, unknown> {
  return {
    name: v.name.trim(),
    location: blank(v.location),
    capacity: v.capacity && String(v.capacity).trim() !== '' ? parseInt(String(v.capacity), 10) : undefined,
    coordinator_user_id: blank(v.coordinator_user_id),
  };
}
