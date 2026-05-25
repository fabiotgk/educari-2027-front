import { Sidebar } from '@/components/dashboard/sidebar';
import { DemoGuard } from '@/components/dashboard/demo-guard';

/**
 * Layout do dashboard admin — sidebar persistente + área de conteúdo
 * que cada rota preenche com sua própria Topbar (para breadcrumbs
 * contextuais). DemoGuard exige uma persona escolhida (/login) enquanto
 * o OAuth real não conecta.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoGuard>
      {/* Viewport fixo: a sidebar mantém altura total e rola por dentro;
          só a área de conteúdo (main) rola. */}
      <div className="flex h-screen overflow-hidden">
        <Sidebar className="hidden lg:flex" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </DemoGuard>
  );
}
