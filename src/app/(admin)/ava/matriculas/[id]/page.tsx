import { CourseEnrollmentDetailPage } from '@/features/course-enrollments/course-enrollment-detail';

export default async function MatriculaAvaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseEnrollmentDetailPage id={id} />;
}
