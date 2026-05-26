import { CourseFormPage } from '@/features/courses/course-form';

export default async function EditarCursoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseFormPage courseId={id} />;
}
