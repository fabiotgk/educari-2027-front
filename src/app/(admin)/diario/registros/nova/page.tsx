import type { Metadata } from 'next';
import { TeachingRecordFormPage } from '@/features/teaching-records/teaching-record-form';

export const metadata: Metadata = { title: 'Novo registro de aula · Diário Online' };

export default async function NovoRegistroAulaPage({
  searchParams,
}: {
  searchParams: Promise<{ class_diary_id?: string }>;
}) {
  const { class_diary_id: classDiaryId } = await searchParams;
  return <TeachingRecordFormPage classDiaryId={classDiaryId} />;
}

