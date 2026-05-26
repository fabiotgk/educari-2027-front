import type { Metadata } from 'next';
import { EducacensoExportsPage } from '@/features/educacenso-exports/educacenso-exports-page';

export const metadata: Metadata = { title: 'EDUCACENSO · M18' };

export default function EducacensoPage() {
  return <EducacensoExportsPage />;
}
