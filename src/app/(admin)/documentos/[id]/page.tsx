import { DocumentTemplateDetailPage } from '@/features/document-templates/document-template-detail';

export default async function DocumentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DocumentTemplateDetailPage id={id} />;
}
