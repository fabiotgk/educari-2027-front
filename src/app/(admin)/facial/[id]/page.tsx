import { FacialEnrollmentDetailPage } from '@/features/facial-enrollments/facial-enrollment-detail';

export default async function FacialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FacialEnrollmentDetailPage id={id} />;
}
