import { DocumentTemplateFormPage } from '@/features/document-templates/document-template-form';

export default async function EditarDocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DocumentTemplateFormPage templateId={id} />;
}
