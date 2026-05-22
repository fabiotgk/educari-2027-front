import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TenantProvider } from '@/lib/providers/tenant-provider';
import { QueryProvider } from '@/lib/providers/query-provider';
import { MOCK_TENANT } from '@/data/mock';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'latin-ext'],
});

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
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <QueryProvider>
          <TenantProvider tenant={tenant}>
            <TooltipProvider>{children}</TooltipProvider>
          </TenantProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
