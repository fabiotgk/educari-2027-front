import { CourseModuleDetailPage } from '@/features/course-modules/course-module-detail';

export default async function ModuloDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseModuleDetailPage id={id} />;
}
