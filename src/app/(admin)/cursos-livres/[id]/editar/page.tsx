import { OpenCourseFormPage } from '@/features/open-courses/open-course-form';

export default async function EditarCursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OpenCourseFormPage openCourseId={id} />;
}
