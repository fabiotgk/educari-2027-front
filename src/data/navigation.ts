/**
 * Árvore de navegação da sidebar (menus e submenus).
 *
 * Itens com `children` viram menus expansíveis; itens com `href` são links
 * diretos. `moduleKey` liga o item à feature flag do tenant (gating
 * "não contratado"). Separado de data/modules.ts (catálogo) porque navegação
 * é sobre telas/rotas, não sobre o módulo comercial.
 */

export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  icon: string;
  /** Link direto (folha). Ausente quando o item é um menu com children. */
  href?: string;
  /** Feature flag do módulo, para gating de "não contratado". */
  moduleKey?: string;
  /** Submenu. */
  children?: NavChild[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_OVERVIEW: NavItem = {
  label: 'Visão Geral',
  icon: 'LayoutDashboard',
  href: '/',
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Pedagógico',
    items: [
      { label: 'Cadastros', icon: 'Building2', moduleKey: 'M01_school_registry', href: '/cadastros' },
      { label: 'Pré-Matrícula', icon: 'ClipboardList', moduleKey: 'M02_pre_enrollment', href: '/pre-matricula' },
      {
        label: 'Matrícula',
        icon: 'UserPlus',
        moduleKey: 'M03_enrollment',
        children: [
          { label: 'Alunos', href: '/alunos' },
          { label: 'Responsáveis', href: '/responsaveis' },
          { label: 'Matrículas', href: '/matriculas' },
        ],
      },
      {
        label: 'Diário Online',
        icon: 'BookOpen',
        moduleKey: 'M04_class_diary_web',
        href: '/diario',
        children: [
          { label: 'Diários', href: '/diario' },
          { label: 'Planos de Aula', href: '/diario/planos' },
          { label: 'Registros', href: '/diario/registros' },
          { label: 'Períodos Avaliativos', href: '/diario/periodos' },
          { label: 'Habilidades BNCC', href: '/diario/habilidades' },
        ],
      },
      { label: 'Diário Móvel', icon: 'Smartphone', moduleKey: 'M05_class_diary_mobile', href: '/diario-mobile' },
      { label: 'Frequência', icon: 'CalendarCheck', moduleKey: 'M06_attendance', href: '/frequencia' },
      { label: 'Notas e Boletim', icon: 'GraduationCap', moduleKey: 'M07_grades', href: '/notas' },
      { label: 'Documentação', icon: 'FileText', moduleKey: 'M08_school_documents', href: '/documentos' },
      { label: 'Calendário', icon: 'Calendar', moduleKey: 'M09_school_calendar', href: '/calendario' },
    ],
  },
  {
    label: 'Comunicação & Portais',
    items: [
      { label: 'Portal Educacional', icon: 'Globe', moduleKey: 'M10_school_portal', href: '/portal' },
      { label: 'Comunicação', icon: 'MessageSquare', moduleKey: 'M11_communication', href: '/comunicacao' },
      { label: 'Portal do Aluno', icon: 'UserCircle', moduleKey: 'M12_student_portal', href: '/portal-aluno' },
      { label: 'App Família', icon: 'Smartphone', moduleKey: 'M13_mobile_family', href: '/mobile/familia' },
      { label: 'App Gestores', icon: 'Smartphone', moduleKey: 'M14_mobile_managers', href: '/mobile/gestores' },
    ],
  },
  {
    label: 'Gestão de Pessoas',
    items: [
      { label: 'Frequência Servidores', icon: 'Users', moduleKey: 'M15_staff_attendance', href: '/servidores/frequencia' },
      { label: 'Capacitação', icon: 'GraduationCap', moduleKey: 'M16_teacher_training', href: '/capacitacao' },
      { label: 'Concurso de Remoção', icon: 'ArrowLeftRight', moduleKey: 'M17_teacher_transfer', href: '/remocao' },
      { label: 'RH Magistério', icon: 'BriefcaseBusiness', moduleKey: 'M33_teacher_hr', href: '/rh' },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { label: 'EDUCACENSO', icon: 'ShieldCheck', moduleKey: 'M18_educacenso', href: '/educacenso' },
      { label: 'Monitor de Evasão', icon: 'TrendingDown', moduleKey: 'M19_evasion_monitoring', href: '/evasao' },
      { label: 'Acesso e Auditoria', icon: 'ShieldAlert', moduleKey: 'M26_access_audit', href: '/auditoria' },
    ],
  },
  {
    label: 'Administrativo & Logística',
    items: [
      { label: 'Transporte', icon: 'Bus', moduleKey: 'M20_school_transport', href: '/transporte' },
      { label: 'Alimentação PNAE', icon: 'UtensilsCrossed', moduleKey: 'M21_school_meals', href: '/alimentacao' },
      { label: 'Financeiro SME', icon: 'DollarSign', moduleKey: 'M22_financial', href: '/financeiro' },
      { label: 'Patrimônio', icon: 'Package', moduleKey: 'M23_school_assets', href: '/patrimonio' },
      { label: 'Biblioteca', icon: 'BookMarked', moduleKey: 'M24_school_library', href: '/biblioteca' },
      { label: 'Material Escolar', icon: 'ShoppingBag', moduleKey: 'M25_school_supplies', href: '/material' },
      { label: 'Infra Monitoring', icon: 'Activity', moduleKey: 'M27_infra_monitoring', href: '/infra' },
      { label: 'HelpDesk', icon: 'LifeBuoy', moduleKey: 'M30_helpdesk', href: '/helpdesk' },
    ],
  },
  {
    label: 'Avaliação & IA',
    items: [
      { label: 'Banco de Questões', icon: 'Database', moduleKey: 'M34_question_bank', href: '/banco-questoes' },
      { label: 'IA Avaliação Textual', icon: 'Sparkles', moduleKey: 'M29_ai_text_evaluation', href: '/ia-redacao' },
      { label: 'Ensino Adaptativo IA', icon: 'Brain', moduleKey: 'M32_adaptive_ai', href: '/ia-adaptativo' },
      { label: 'Reconhecimento Facial', icon: 'ScanFace', moduleKey: 'M28_facial_recognition', href: '/facial' },
    ],
  },
  {
    label: 'EAD & Expansão',
    items: [
      {
        label: 'AVA / LMS',
        icon: 'Monitor',
        moduleKey: 'M31_lms_ava',
        href: '/ava',
        children: [
          { label: 'Cursos', href: '/ava' },
          { label: 'Módulos', href: '/ava/modulos' },
          { label: 'Aulas', href: '/ava/aulas' },
          { label: 'Avisos', href: '/ava/avisos' },
          { label: 'Avaliações', href: '/ava/avaliacoes' },
          { label: 'Fóruns', href: '/ava/foruns' },
          { label: 'Matrículas', href: '/ava/matriculas' },
        ],
      },
      { label: 'Polos EAD', icon: 'MapPin', moduleKey: 'M35_distance_centers', href: '/polos' },
      { label: 'PNAE Estadual', icon: 'UtensilsCrossed', moduleKey: 'M36_pnae_state', href: '/pnae-estadual' },
      { label: 'Cursos Livres', icon: 'Award', moduleKey: 'M38_open_courses', href: '/cursos-livres' },
      { label: 'Educação Especial', icon: 'Heart', moduleKey: 'M37_special_education', href: '/aee' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        label: 'Configurações',
        icon: 'Settings',
        children: [
          { label: 'Módulos', href: '/configuracoes/modulos' },
          { label: 'Geral', href: '/configuracoes' },
        ],
      },
    ],
  },
];
