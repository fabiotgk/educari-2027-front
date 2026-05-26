import type { Metadata } from 'next';
import { ClassDiaryFormPage } from '@/features/class-diaries/class-diary-form';

export const metadata: Metadata = { title: 'Novo diário · Diário Online' };

export default function NovoDiarioPage() {
  return <ClassDiaryFormPage />;
}

