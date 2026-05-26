export type ClassDiary = {
  id: string;
  tenant_id: string;
  class_id: string;
  subject_id: string;
  teacher_user_id: string;
  academic_year: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  class?: ClassResource | null;
  subject?: SubjectResource | null;
  teacher?: UserResource | null;
};

export interface ClassResource {
  id: string;
  code?: string | null;
  name?: string | null;
}

export interface SubjectResource {
  id: string;
  code?: string | null;
  name?: string | null;
}

export interface UserResource {
  id: string;
  name?: string | null;
  email?: string | null;
}

export const CLASS_DIARY_STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
};

export function classDiaryStatusLabel(isActive: boolean): string {
  return isActive ? CLASS_DIARY_STATUS_LABELS.active : CLASS_DIARY_STATUS_LABELS.inactive;
}

export function classLabel(resource: ClassResource | null | undefined): string {
  if (!resource) return 'Turma não informada';
  if (resource.name && resource.name.trim()) return resource.name;
  if (resource.code && resource.code.trim()) return resource.code;
  return resource.id;
}

export function subjectLabel(resource: SubjectResource | null | undefined): string {
  if (!resource) return 'Componente não informado';
  if (resource.name && resource.name.trim()) return resource.name;
  if (resource.code && resource.code.trim()) return resource.code;
  return resource.id;
}

export function teacherLabel(resource: UserResource | null | undefined): string {
  if (!resource) return 'Professor não informado';
  if (resource.name && resource.name.trim()) return resource.name;
  if (resource.email && resource.email.trim()) return resource.email;
  return resource.id;
}
