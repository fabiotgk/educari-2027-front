import type { Metadata } from 'next';
import { CourseAnnouncementsPage } from '@/features/course-announcements/course-announcements-page';

export const metadata: Metadata = { title: 'Avisos · AVA / LMS' };

export default function AvisosPage() {
  return <CourseAnnouncementsPage />;
}
