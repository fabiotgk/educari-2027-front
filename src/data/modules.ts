import type { ModuleDescriptor } from '@/types/tenant';

/**
 * Catálogo completo dos 38 módulos M01–M38 do Educari.
 *
 * Espelha config/tenant-features.php do backend. Quando um módulo
 * não está habilitado (feature flag) para o tenant atual, a sidebar
 * marca o item como "Não contratado".
 *
 * Ver docs/EDUCARI-SPEC.md §3 e §3B.
 */
export const MODULES: ModuleDescriptor[] = [
  // ─── Core Pedagógico ──────────────────────────────────────────────
  { key: 'M01_school_registry', code: 'M01', label: 'Cadastros', icon: 'Building2', href: '/cadastros', group: 'core' },
  { key: 'M02_pre_enrollment', code: 'M02', label: 'Pré-Matrícula', icon: 'ClipboardList', href: '/pre-matricula', group: 'core' },
  { key: 'M03_enrollment', code: 'M03', label: 'Matrícula', icon: 'UserPlus', href: '/matriculas', group: 'core' },
  { key: 'M04_class_diary_web', code: 'M04', label: 'Diário Online', icon: 'BookOpen', href: '/diario', group: 'core' },
  { key: 'M05_class_diary_mobile', code: 'M05', label: 'Diário Móvel', icon: 'Smartphone', href: '/diario-mobile', group: 'core' },
  { key: 'M06_attendance', code: 'M06', label: 'Frequência', icon: 'CalendarCheck', href: '/frequencia', group: 'core' },
  { key: 'M07_grades', code: 'M07', label: 'Notas e Boletim', icon: 'GraduationCap', href: '/notas', group: 'core' },
  { key: 'M08_school_documents', code: 'M08', label: 'Documentação', icon: 'FileText', href: '/documentos', group: 'core' },
  { key: 'M09_school_calendar', code: 'M09', label: 'Calendário', icon: 'Calendar', href: '/calendario', group: 'core' },

  // ─── Comunicação / Portal ─────────────────────────────────────────
  { key: 'M10_school_portal', code: 'M10', label: 'Portal Educacional', icon: 'Globe', href: '/portal', group: 'core' },
  { key: 'M11_communication', code: 'M11', label: 'Comunicação', icon: 'MessageSquare', href: '/comunicacao', group: 'core' },
  { key: 'M12_student_portal', code: 'M12', label: 'Portal do Aluno', icon: 'UserCircle', href: '/portal-aluno', group: 'core' },

  // ─── Mobile ───────────────────────────────────────────────────────
  { key: 'M13_mobile_family', code: 'M13', label: 'App Família', icon: 'Smartphone', href: '/mobile/familia', group: 'mobile' },
  { key: 'M14_mobile_managers', code: 'M14', label: 'App Gestores', icon: 'Smartphone', href: '/mobile/gestores', group: 'mobile' },

  // ─── RH e Capacitação ─────────────────────────────────────────────
  { key: 'M15_staff_attendance', code: 'M15', label: 'Frequência Servidores', icon: 'Users', href: '/servidores/frequencia', group: 'admin' },
  { key: 'M16_teacher_training', code: 'M16', label: 'Capacitação', icon: 'GraduationCap', href: '/capacitacao', group: 'admin' },
  { key: 'M17_teacher_transfer', code: 'M17', label: 'Concurso de Remoção', icon: 'ArrowLeftRight', href: '/remocao', group: 'admin' },

  // ─── Compliance ───────────────────────────────────────────────────
  { key: 'M18_educacenso', code: 'M18', label: 'EDUCACENSO', icon: 'ShieldCheck', href: '/educacenso', group: 'core' },
  { key: 'M19_evasion_monitoring', code: 'M19', label: 'Monitor de Evasão', icon: 'TrendingDown', href: '/evasao', group: 'core' },

  // ─── Logística ────────────────────────────────────────────────────
  { key: 'M20_school_transport', code: 'M20', label: 'Transporte', icon: 'Bus', href: '/transporte', group: 'admin' },
  { key: 'M21_school_meals', code: 'M21', label: 'Alimentação PNAE', icon: 'UtensilsCrossed', href: '/alimentacao', group: 'admin' },

  // ─── Administrativo ───────────────────────────────────────────────
  { key: 'M22_financial', code: 'M22', label: 'Financeiro SME', icon: 'DollarSign', href: '/financeiro', group: 'admin' },
  { key: 'M23_school_assets', code: 'M23', label: 'Patrimônio', icon: 'Package', href: '/patrimonio', group: 'admin' },
  { key: 'M24_school_library', code: 'M24', label: 'Biblioteca', icon: 'BookMarked', href: '/biblioteca', group: 'admin' },
  { key: 'M25_school_supplies', code: 'M25', label: 'Material Escolar', icon: 'ShoppingBag', href: '/material', group: 'admin' },

  // ─── Segurança e Monitoramento ────────────────────────────────────
  { key: 'M26_access_audit', code: 'M26', label: 'Acesso e Auditoria', icon: 'ShieldAlert', href: '/auditoria', group: 'admin' },
  { key: 'M27_infra_monitoring', code: 'M27', label: 'Infra Monitoring', icon: 'Activity', href: '/infra', group: 'admin' },
  { key: 'M28_facial_recognition', code: 'M28', label: 'Reconhecimento Facial', icon: 'ScanFace', href: '/facial', group: 'admin' },

  // ─── IA ────────────────────────────────────────────────────────────
  { key: 'M29_ai_text_evaluation', code: 'M29', label: 'IA Avaliação Textual', icon: 'Sparkles', href: '/ia-redacao', group: 'expansion' },

  // ─── Suporte ──────────────────────────────────────────────────────
  { key: 'M30_helpdesk', code: 'M30', label: 'HelpDesk', icon: 'LifeBuoy', href: '/helpdesk', group: 'core' },

  // ─── Expansão (M31–M38) ──────────────────────────────────────────
  { key: 'M31_lms_ava', code: 'M31', label: 'AVA / LMS', icon: 'Monitor', href: '/ava', group: 'expansion' },
  { key: 'M32_adaptive_ai', code: 'M32', label: 'Ensino Adaptativo IA', icon: 'Brain', href: '/ia-adaptativo', group: 'expansion' },
  { key: 'M33_teacher_hr', code: 'M33', label: 'RH Magistério', icon: 'BriefcaseBusiness', href: '/rh', group: 'expansion' },
  { key: 'M34_question_bank', code: 'M34', label: 'Banco de Questões', icon: 'Database', href: '/banco-questoes', group: 'expansion' },
  { key: 'M35_distance_centers', code: 'M35', label: 'Polos EAD', icon: 'MapPin', href: '/polos', group: 'expansion' },
  { key: 'M36_pnae_state', code: 'M36', label: 'PNAE Estadual', icon: 'UtensilsCrossed', href: '/pnae-estadual', group: 'expansion' },
  { key: 'M37_special_education', code: 'M37', label: 'Educação Especial', icon: 'Heart', href: '/aee', group: 'expansion' },
  { key: 'M38_open_courses', code: 'M38', label: 'Cursos Livres', icon: 'Award', href: '/cursos-livres', group: 'expansion' },
];

export const MODULE_GROUPS = {
  core: 'Core Pedagógico',
  mobile: 'Mobile',
  admin: 'Administrativo',
  expansion: 'Expansão (Estadual/EAD)',
} as const;
