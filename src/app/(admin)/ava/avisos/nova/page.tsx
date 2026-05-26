import type { Metadata } from 'next';
import { CourseAnnouncementFormPage } from '@/features/course-announcements/course-announcement-form';

export const metadata: Metadata = { title: 'Novo aviso · AVA / LMS' };

export default function NovoAvisoPage() {
  return <CourseAnnouncementFormPage />;
}
