'use client';

import { useAuth } from '@/lib/auth';

/**
 * Papéis (roles) do RBAC — espelham o backend (Spatie, RolesAndPermissionsSeeder).
 */
export type RoleKey =
  | 'tenant.super_admin'
  | 'tenant.secretary'
  | 'school.principal'
  | 'school.vice_principal'
  | 'school.pedagogical_coordinator'
  | 'school.secretary'
  | 'school.teacher'
  | 'guardian'
  | 'student';

export const ROLE_LABELS: Record<string, string> = {
  'tenant.super_admin': 'Administrador da Rede',
  'tenant.secretary': 'Secretário Municipal',
  'school.principal': 'Diretor Escolar',
  'school.vice_principal': 'Vice-Diretor',
  'school.pedagogical_coordinator': 'Coordenador Pedagógico',
  'school.secretary': 'Secretário Escolar',
  'school.teacher': 'Professor',
  guardian: 'Responsável',
  student: 'Aluno',
};

/** Papel principal do usuário autenticado (o primeiro atribuído). */
export function usePrimaryRole(): string | null {
  const { user } = useAuth();
  return user?.roles?.[0] ?? null;
}

export function roleLabel(role: string | null | undefined): string {
  return role ? (ROLE_LABELS[role] ?? role) : '';
}
