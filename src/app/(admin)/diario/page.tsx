import type { Metadata } from 'next';
import { ClassDiariesPage } from '@/features/class-diaries/class-diaries-page';

export const metadata: Metadata = { title: 'Diário Online' };

export default function DiarioPage() {
  return <ClassDiariesPage />;
}

