import { CourseAnnouncementDetailPage } from '@/features/course-announcements/course-announcement-detail';

export default async function AvisoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseAnnouncementDetailPage id={id} />;
}
