import type { Metadata } from 'next';
import { CourseModuleFormPage } from '@/features/course-modules/course-module-form';

export const metadata: Metadata = { title: 'Novo módulo · AVA / LMS' };

export default function NovoModuloPage() {
  return <CourseModuleFormPage />;
}
