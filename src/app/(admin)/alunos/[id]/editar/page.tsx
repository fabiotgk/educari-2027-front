import { StudentFormPage } from '@/features/students/student-form';

export default async function EditarAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentFormPage studentId={id} />;
}
