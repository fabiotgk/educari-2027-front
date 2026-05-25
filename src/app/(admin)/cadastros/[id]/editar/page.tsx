import { SchoolFormPage } from '@/features/schools/school-form';

export default async function EditarEscolaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SchoolFormPage schoolId={id} />;
}
