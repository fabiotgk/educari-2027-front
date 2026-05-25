/** Tipos do recurso M03 / Alunos — espelham o StudentResource do backend. */

export type StudentGender = 'male' | 'female' | 'non_binary' | 'prefer_not_say';

export type StudentRace = 'branca' | 'parda' | 'preta' | 'amarela' | 'indigena' | 'nao_declarada';

export type StudentStatus = 'active' | 'anonymized';

export interface Student {
  id: string;
  tenant_id: string;
  registration_number: string | null;
  inep_id: string | null;
  full_name: string;
  social_name: string | null;
  birth_date: string | null;
  gender: StudentGender | null;
  race: StudentRace | null;
  nationality: string | null;
  birth_state: string | null;
  birth_city: string | null;
  photo_url: string | null;
  notes: string | null;
  phonetic_name: string | null;
  anonymized_at: string | null;
  has_pii: boolean;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  /** Documentos */
  birth_certificate_number: string | null;
  cpf: string | null;
  rg: string | null;
  rg_issuer: string | null;
  nis: string | null;
}

export const GENDER_LABELS: Record<StudentGender, string> = {
  male: 'Masculino',
  female: 'Feminino',
  non_binary: 'Não binário',
  prefer_not_say: 'Prefere não informar',
};

export const RACE_LABELS: Record<StudentRace, string> = {
  branca: 'Branca',
  parda: 'Parda',
  preta: 'Preta',
  amarela: 'Amarela',
  indigena: 'Indígena',
  nao_declarada: 'Não declarada',
};

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  active: 'Ativo',
  anonymized: 'Anonimizado',
};
