import type { Metadata } from 'next';

import { EvasionOccurrencesPage } from '@/features/evasion-occurrences/evasion-occurrences-page';

export const metadata: Metadata = { title: 'Ocorrências de Evasão · Monitor de Evasão' };

export default function EvasionOccurrencesRoutePage() {
  return <EvasionOccurrencesPage />;
}
