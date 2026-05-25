import { StudentDetailPage } from '@/features/students/student-detail';

export default async function AlunoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentDetailPage id={id} />;
}
