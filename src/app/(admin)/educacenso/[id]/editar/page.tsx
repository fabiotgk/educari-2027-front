import { EducacensoExportFormPage } from '@/features/educacenso-exports/educacenso-export-form';

export default async function EditarEducacensoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EducacensoExportFormPage exportId={id} />;
}
