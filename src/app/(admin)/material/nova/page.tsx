import type { Metadata } from 'next';
import { SchoolKitFormPage } from '@/features/school-kits/school-kit-form';

export const metadata: Metadata = { title: 'Novo kit · Material Escolar' };

export default function NovoKitPage() {
  return <SchoolKitFormPage />;
}
