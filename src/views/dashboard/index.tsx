'use client';

import { createRoleView } from '@/views/role-view';
import SecretaryDashboard from './secretary';
import PrincipalDashboard from './principal';
import TeacherDashboard from './teacher';
import GuardianDashboard from './guardian';
import DefaultDashboard from './_default';

/**
 * Dashboard — rota única (app/(admin)/page.tsx) que renderiza a view do
 * papel do usuário. Padrão: ver src/views/role-view.tsx.
 */
export const DashboardView = createRoleView({
  // Rede
  'tenant.super_admin': SecretaryDashboard,
  'tenant.secretary': SecretaryDashboard,
  // Escola
  'school.principal': PrincipalDashboard,
  'school.vice_principal': PrincipalDashboard,
  'school.pedagogical_coordinator': PrincipalDashboard,
  'school.secretary': PrincipalDashboard,
  // Docente
  'school.teacher': TeacherDashboard,
  // Família
  guardian: GuardianDashboard,
  student: GuardianDashboard,
  _default: DefaultDashboard,
});
