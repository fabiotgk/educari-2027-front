export type EvasionAlertScope = 'monthly' | 'period' | 'custom';

export interface EvasionAlert {
  id: string;
  tenant_id: string;
  school_id: string | null;
  name: string;
  scope: EvasionAlertScope;
  min_attendance_pct: number | string | null;
  max_consecutive_absences: number | string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export const EVASION_ALERT_SCOPE_LABELS: Record<EvasionAlertScope, string> = {
  monthly: 'Mensal',
  period: 'Por período',
  custom: 'Customizado',
};
