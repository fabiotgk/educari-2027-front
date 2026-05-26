import type { Metadata } from 'next';
import { AccessGrantFormPage } from '@/features/access-grants/access-grant-form';

export const metadata: Metadata = { title: 'Nova concessão · Acesso e Auditoria' };

export default function NovaConcessaoPage() {
  return <AccessGrantFormPage />;
}
