import type { Metadata } from 'next';
import { SitesPage } from '@/features/sites/sites-page';

export const metadata: Metadata = { title: 'Portal Educacional · M10' };

export default function PortalPage() {
  return <SitesPage />;
}
