import type { Metadata } from 'next';

import { EvasionOccurrenceFormPage } from '@/features/evasion-occurrences/evasion-occurrence-form';

export const metadata: Metadata = { title: 'Nova ocorrência · Monitor de Evasão' };

export default function NovaOcorrenciaEvasaoPage() {
  return <EvasionOccurrenceFormPage />;
}
