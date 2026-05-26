import type { Metadata } from 'next';
import { SchoolKitsPage } from '@/features/school-kits/school-kits-page';

export const metadata: Metadata = { title: 'Kits Escolares · Material Escolar' };

export default function MaterialPage() {
  return <SchoolKitsPage />;
}
