import type { Metadata } from 'next';
import { CourseEnrollmentsPage } from '@/features/course-enrollments/course-enrollments-page';

export const metadata: Metadata = { title: 'Matrículas · AVA / LMS' };

export default function MatriculasAvaPage() {
  return <CourseEnrollmentsPage />;
}
