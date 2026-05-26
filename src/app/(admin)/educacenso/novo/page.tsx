import type { Metadata } from 'next';
import { EducacensoExportFormPage } from '@/features/educacenso-exports/educacenso-export-form';

export const metadata: Metadata = { title: 'Nova exportação · EDUCACENSO' };

export default function NovoEducacensoPage() {
  return <EducacensoExportFormPage />;
}
