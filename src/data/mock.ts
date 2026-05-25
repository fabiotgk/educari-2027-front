import type { TenantConfig } from '@/types/tenant';

/**
 * Mock data — substituído por chamadas reais à API quando
 * educari-2027-infra estiver respondendo em /api/v1/tenant/config.
 *
 * Não usar em produção. Apenas para desenvolvimento UI até a
 * primeira integração funcional ficar pronta.
 */
export const MOCK_TENANT: TenantConfig = {
  tenant_id: 'tnt_demo_mariana',
  slug: 'mariana',
  status: 'active',
  theme: {
    logo_url: null,
    logo_dark_url: null,
    favicon_url: null,
    primary_color: '#FF6B35',
    secondary_color: '#1F2A3D',
    accent_color: '#5FB0A6',
    text_color: '#1A1A1A',
    background_color: '#FFFFFF',
    surface_color: '#F5F5F5',
    font_family: 'Inter',
    institutional_name: 'Secretaria Municipal de Educação de Mariana',
    institutional_short_name: 'SME Mariana',
    institutional_state: 'MG',
    institutional_city: 'Mariana',
    contact_email: 'educacao@mariana.mg.gov.br',
    contact_phone: '(31) 3559-0000',
  },
  feature_flags: [
    // Módulos ativados no plano Mariana (exemplo MVP)
    { feature_key: 'M01_school_registry', enabled: true },
    { feature_key: 'M02_pre_enrollment', enabled: true },
    { feature_key: 'M03_enrollment', enabled: true },
    { feature_key: 'M04_class_diary_web', enabled: true },
    { feature_key: 'M05_class_diary_mobile', enabled: true },
    { feature_key: 'M06_attendance', enabled: true },
    { feature_key: 'M07_grades', enabled: true },
    { feature_key: 'M08_school_documents', enabled: true },
    { feature_key: 'M09_school_calendar', enabled: true },
    { feature_key: 'M11_communication', enabled: true },
    { feature_key: 'M12_student_portal', enabled: true },
    { feature_key: 'M13_mobile_family', enabled: true },
    { feature_key: 'M14_mobile_managers', enabled: true },
    { feature_key: 'M18_educacenso', enabled: true },
    { feature_key: 'M19_evasion_monitoring', enabled: true },
    { feature_key: 'M20_school_transport', enabled: true },
    { feature_key: 'M21_school_meals', enabled: true },
    { feature_key: 'M22_financial', enabled: true },
    { feature_key: 'M26_access_audit', enabled: true },
    { feature_key: 'M30_helpdesk', enabled: true },
  ],
  settings: [],
};

/**
 * Métricas mock para o dashboard.
 */
export const MOCK_METRICS = {
  students: 7482,
  active_enrollments: 7341,
  pending_pre_enrollments: 152,
  average_attendance_pct: 92.4,
  schools_count: 37,
  teachers_count: 384,
};

/**
 * Atividade recente mock.
 */
export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'grade' | 'document' | 'communication' | 'attendance';
  title: string;
  description: string;
  user: string;
  timestamp: string;
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: '01HXY1',
    type: 'enrollment',
    title: 'Matrícula efetivada',
    description: 'Maria Silva — Turma 5º A',
    user: 'Secretaria E. M. João da Cruz',
    timestamp: '2026-05-22T10:24:00Z',
  },
  {
    id: '01HXY2',
    type: 'grade',
    title: 'Boletim do 1º bimestre gerado',
    description: '142 alunos — E. M. Pe. Augusto',
    user: 'Coord. Pedagógico',
    timestamp: '2026-05-22T10:18:00Z',
  },
  {
    id: '01HXY3',
    type: 'document',
    title: 'Histórico escolar emitido',
    description: 'João Carlos — transferência',
    user: 'Secretaria E. M. São José',
    timestamp: '2026-05-22T09:52:00Z',
  },
  {
    id: '01HXY4',
    type: 'communication',
    title: 'Circular enviada',
    description: 'Reunião de pais — 234 destinatários',
    user: 'SME Mariana',
    timestamp: '2026-05-22T09:30:00Z',
  },
  {
    id: '01HXY5',
    type: 'attendance',
    title: 'Frequência fechada',
    description: '5º A — 28 presentes, 2 faltas',
    user: 'Prof. Carlos Mendes',
    timestamp: '2026-05-22T09:15:00Z',
  },
];

/**
 * Tenants mock (para switch no topo do dashboard).
 */
export interface TenantOption {
  slug: string;
  name: string;
  short_name: string;
}

export const MOCK_TENANTS: TenantOption[] = [
  { slug: 'mariana', name: 'Prefeitura de Mariana — MG', short_name: 'SME Mariana' },
  { slug: 'rio-pomba', name: 'Prefeitura de Rio Pomba — MG', short_name: 'SME Rio Pomba' },
  { slug: 'itapetininga', name: 'Prefeitura de Itapetininga — SP', short_name: 'SME Itapetininga' },
];
