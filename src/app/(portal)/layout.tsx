import { PortalAuthProvider } from '@/lib/providers/portal-auth-provider';
import { PortalLayout } from '@/features/portal/portal-layout';

export default function PortalRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalAuthProvider>
      <PortalLayout>{children}</PortalLayout>
    </PortalAuthProvider>
  );
}
