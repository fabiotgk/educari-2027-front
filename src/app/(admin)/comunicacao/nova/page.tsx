import type { Metadata } from 'next';
import { AnnouncementFormPage } from '@/features/announcements/announcement-form';

export const metadata: Metadata = { title: 'Novo comunicado · Comunicação' };

export default function NovoComunicadoPage() {
  return <AnnouncementFormPage />;
}
