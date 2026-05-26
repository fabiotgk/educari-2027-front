import type { Metadata } from 'next';
import { CourseEnrollmentFormPage } from '@/features/course-enrollments/course-enrollment-form';

export const metadata: Metadata = { title: 'Nova matrícula · AVA / LMS' };

export default async function NovaMatriculaAvaPage({
  searchParams,
}: {
  searchParams: Promise<{ course_id?: string; student_id?: string }>;
}) {
  const { course_id: courseId, student_id: studentId } = await searchParams;
  return <CourseEnrollmentFormPage courseId={courseId} studentId={studentId} />;
}
