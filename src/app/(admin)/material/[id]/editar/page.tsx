import { SchoolKitFormPage } from '@/features/school-kits/school-kit-form';

export default async function EditarKitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SchoolKitFormPage kitId={id} />;
}
