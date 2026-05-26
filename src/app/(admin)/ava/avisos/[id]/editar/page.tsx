import { CourseAnnouncementFormPage } from '@/features/course-announcements/course-announcement-form';

export default async function EditarAvisoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseAnnouncementFormPage announcementId={id} />;
}
