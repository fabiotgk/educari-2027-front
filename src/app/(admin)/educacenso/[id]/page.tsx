import { EducacensoExportDetailPage } from '@/features/educacenso-exports/educacenso-export-detail';

export default async function EducacensoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EducacensoExportDetailPage id={id} />;
}
