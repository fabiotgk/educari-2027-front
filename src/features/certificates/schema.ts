import { z } from 'zod';

import type { Certificate } from './types';

export const certificateSchema = z.object({
  course_enrollment_id: z.string().uuid('Informe um UUID válido para a matrícula.'),
  certificate_code: z.string().min(1, 'O código do certificado é obrigatório.').max(255),
  issued_at: z.string().optional(),
  workload_hours: z.string().optional(),
  verification_url: z.string().max(2048).optional(),
  pdf_url: z.string().max(2048).optional(),
});

export type CertificateFormValues = z.infer<typeof certificateSchema>;

export const emptyCertificateForm: CertificateFormValues = {
  course_enrollment_id: '',
  certificate_code: '',
  issued_at: '',
  workload_hours: '',
  verification_url: '',
  pdf_url: '',
};

const blank = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);
const dateTimeLocal = (v: string | null) => (v ? v.slice(0, 16) : '');

export function certificateToForm(c: Certificate): CertificateFormValues {
  return {
    course_enrollment_id: c.course_enrollment_id,
    certificate_code: c.certificate_code,
    issued_at: dateTimeLocal(c.issued_at),
    workload_hours: c.workload_hours != null ? String(c.workload_hours) : '',
    verification_url: c.verification_url ?? '',
    pdf_url: c.pdf_url ?? '',
  };
}

export function buildCertificatePayload(v: CertificateFormValues): Record<string, unknown> {
  return {
    course_enrollment_id: v.course_enrollment_id,
    certificate_code: v.certificate_code.trim(),
    issued_at: blank(v.issued_at),
    workload_hours: blank(v.workload_hours) !== undefined ? Number(v.workload_hours) : undefined,
    verification_url: blank(v.verification_url),
    pdf_url: blank(v.pdf_url),
  };
}
