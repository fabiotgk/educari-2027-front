import { Sidebar } from '@/components/dashboard/sidebar';

/**
 * Layout do dashboard admin — sidebar persistente + área de conteúdo
 * que cada rota preenche com sua própria Topbar (para breadcrumbs
 * contextuais).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden lg:flex" />
      <div className="flex-1 flex flex-col min-w-0">{children}</div>
    </div>
  );
}
