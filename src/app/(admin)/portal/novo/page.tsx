import type { Metadata } from 'next';
import { SiteFormPage } from '@/features/sites/site-form';

export const metadata: Metadata = { title: 'Novo site · Portal Educacional' };

export default function NovoPortalPage() {
  return <SiteFormPage />;
}
