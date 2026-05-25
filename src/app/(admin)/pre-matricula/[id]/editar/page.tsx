import { PreEnrollmentFormPage } from '@/features/pre-enrollment-applications/pre-enrollment-form';

export default async function EditarPreMatriculaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreEnrollmentFormPage applicationId={id} />;
}
