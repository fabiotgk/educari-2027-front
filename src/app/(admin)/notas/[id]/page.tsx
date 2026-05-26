import { GradeDetailPage } from '@/features/grades/grade-detail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GradeDetailPage id={id} />;
}
