import { FacialEnrollmentFormPage } from '@/features/facial-enrollments/facial-enrollment-form';

export default async function EditarFacialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FacialEnrollmentFormPage resourceId={id} />;
}
