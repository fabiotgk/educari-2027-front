import type { Metadata } from 'next';

import { EvasionAlertsPage } from '@/features/evasion-alerts/evasion-alerts-page';

export const metadata: Metadata = { title: 'Alertas de Evasão · Monitor de Evasão' };

export default function EvasionAlertsRoutePage() {
  return <EvasionAlertsPage />;
}
