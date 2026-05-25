import { DashboardView } from '@/views/dashboard';

/**
 * Rota única do dashboard. A view exibida é resolvida pelo papel do
 * usuário autenticado (ver src/views/dashboard/index.tsx).
 */
export default function DashboardPage() {
  return <DashboardView />;
}
