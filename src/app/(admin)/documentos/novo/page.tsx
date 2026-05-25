import type { Metadata } from 'next';
import { DocumentTemplateFormPage } from '@/features/document-templates/document-template-form';

export const metadata: Metadata = { title: 'Novo template · Documentação' };

export default function NovoDocumentoPage() {
  return <DocumentTemplateFormPage />;
}
