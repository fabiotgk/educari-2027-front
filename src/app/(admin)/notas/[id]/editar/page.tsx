import { GradeFormPage } from '@/features/grades/grade-form';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GradeFormPage gradeId={id} />;
}
