import { CourseModuleFormPage } from '@/features/course-modules/course-module-form';

export default async function EditarModuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CourseModuleFormPage moduleId={id} />;
}
