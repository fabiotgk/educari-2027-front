import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TenantProvider } from '@/lib/providers/tenant-provider';
import { QueryProvider } from '@/lib/providers/query-provider';
import { MOCK_TENANT } from '@/data/mock';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: {
    default: 'Educari — Plataforma de Gestão Educacional',
    template: '%s · Educari',
  },
  description:
    'SaaS multi-tenant de Sistema de Gestão Educacional para prefeituras, SEDUCs, Sistema S e EAD.',
  applicationName: 'Educari',
  authors: [{ name: 'devnx' }],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fallback visual; o tenant REAL vem do TenantProvider via /api/v1/tenant/me
  // quando há sessão (substitui o MOCK).
  return (
    <html
      lang="pt-BR"
      className="h-full overflow-hidden antialiased"
      suppressHydrationWarning
    >
      <body className="h-screen overflow-hidden font-sans">
        <QueryProvider>
          <TenantProvider fallback={MOCK_TENANT}>
            <TooltipProvider>{children}</TooltipProvider>
          </TenantProvider>
        </QueryProvider>
        <ToastContainer
          position="top-right"
          autoClose={4000}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
