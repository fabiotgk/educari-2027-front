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
      <div className="flex min-h-screen">
        <Sidebar className="hidden lg:flex" />
        <div className="flex-1 flex flex-col min-w-0">{children}</div>
      </div>
    </DemoGuard>
  );
}
