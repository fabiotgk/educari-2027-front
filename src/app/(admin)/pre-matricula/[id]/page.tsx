import { PreEnrollmentDetailPage } from '@/features/pre-enrollment-applications/pre-enrollment-detail';

export default async function PreMatriculaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreEnrollmentDetailPage id={id} />;
}
