import type { Metadata } from 'next';
import { SchoolFormPage } from '@/features/schools/school-form';

export const metadata: Metadata = { title: 'Nova escola · Cadastros' };

export default function NovaEscolaPage() {
  return <SchoolFormPage />;
}
