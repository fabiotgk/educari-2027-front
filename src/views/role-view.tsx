'use client';

import { usePrimaryRole } from '@/lib/role';

type ViewComponent = React.ComponentType;

/**
 * Padrão de view por perfil: cada feature tem uma pasta com um arquivo por
 * papel + um `_default`. `createRoleView` monta um resolver que escolhe a
 * view conforme o papel do usuário autenticado.
 *
 * Uso (src/views/<feature>/index.tsx):
 *   export const DashboardView = createRoleView({
 *     'tenant.secretary': Secretary,
 *     'school.teacher': Teacher,
 *     _default: Default,
 *   });
 *
 * E a rota (app/(admin)/page.tsx) só faz: <DashboardView />
 */
export function createRoleView(
  map: Record<string, ViewComponent> & { _default: ViewComponent },
): React.ComponentType {
  function ResolvedRoleView() {
    const role = usePrimaryRole();
    const View = (role && map[role]) || map._default;
    return <View />;
  }
  ResolvedRoleView.displayName = 'ResolvedRoleView';
  return ResolvedRoleView;
}
