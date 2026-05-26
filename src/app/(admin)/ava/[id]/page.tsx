import { CourseDetailPage } from '@/features/courses/course-detail';

export default async function CursoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseDetailPage id={id} />;
}
