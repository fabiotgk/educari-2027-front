import { CourseEnrollmentFormPage } from '@/features/course-enrollments/course-enrollment-form';

export default async function EditarMatriculaAvaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseEnrollmentFormPage courseEnrollmentId={id} />;
}
