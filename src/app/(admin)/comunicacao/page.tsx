import type { Metadata } from 'next';
import { AnnouncementsPage } from '@/features/announcements/announcements-page';

export const metadata: Metadata = { title: 'Comunicados · Comunicação' };

export default function ComunicacaoPage() {
  return <AnnouncementsPage />;
}
