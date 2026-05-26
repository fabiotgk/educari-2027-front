import type { Metadata } from 'next';
import { CourseModulesPage } from '@/features/course-modules/course-modules-page';

export const metadata: Metadata = { title: 'Módulos · AVA / LMS' };

export default function ModulosPage() {
  return <CourseModulesPage />;
}
