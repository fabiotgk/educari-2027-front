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
  // Quando o backend estiver respondendo, este tenant virá de
  // GET /api/v1/tenant/config resolvido pelo subdomínio (ADR-004).
  const tenant = MOCK_TENANT;

  return (
    <html
      lang="pt-BR"
      className="h-full overflow-hidden antialiased"
      suppressHydrationWarning
    >
      <body className="h-screen overflow-hidden font-sans">
        <QueryProvider>
          <TenantProvider tenant={tenant}>
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
