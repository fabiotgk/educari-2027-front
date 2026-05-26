import type { Metadata } from 'next';

import { EvasionAlertFormPage } from '@/features/evasion-alerts/evasion-alert-form';

export const metadata: Metadata = { title: 'Novo alerta · Monitor de Evasão' };

export default function NovaAlertaEvasaoPage() {
  return <EvasionAlertFormPage />;
}
