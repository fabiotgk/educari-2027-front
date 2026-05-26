import { OpenCourseDetailPage } from '@/features/open-courses/open-course-detail';

export default async function CursoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OpenCourseDetailPage id={id} />;
}
