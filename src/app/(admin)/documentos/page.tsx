import type { Metadata } from 'next';
import { DocumentTemplatesPage } from '@/features/document-templates/document-templates-page';

export const metadata: Metadata = { title: 'Documentação' };

/** M08 / SchoolDocuments — Templates de documentos escolares. */
export default function DocumentosPage() {
  return <DocumentTemplatesPage />;
}
