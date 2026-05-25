/**
 * Personas de demonstração — mapeiam os roles do RBAC (Spatie, backend
 * educari-2027-infra: RolesAndPermissionsSeeder) para usuários fictícios
 * da prefeitura de teste, permitindo demonstrar o sistema sob cada papel.
 *
 * NÃO é autenticação real. Apenas seleção de perfil para a demo até o
 * fluxo OAuth (Passport) estar conectado.
 */

export type PersonaScope = 'rede' | 'escola' | 'familia';

export interface DemoPersona {
  /** role exato do backend (Spatie) */
  role: string;
  /** nome fictício do usuário */
  name: string;
  /** cargo legível em PT-BR */
  title: string;
  /** o que esse perfil enxerga, em uma frase */
  description: string;
  /** unidade/contexto quando aplicável */
  context?: string;
  /** ícone lucide */
  icon: string;
  scope: PersonaScope;
}

export const DEMO_TENANT = {
  slug: 'mariana',
  name: 'Prefeitura de Mariana — MG',
  institutional_name: 'Secretaria Municipal de Educação de Mariana',
  short_name: 'SME Mariana',
  city: 'Mariana',
  state: 'MG',
};

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'tenant.super_admin',
    name: 'Ana Paula Ferreira',
    title: 'Administradora da Rede',
    description: 'Acesso total — configuração, todos os módulos e escolas.',
    icon: 'ShieldCheck',
    scope: 'rede',
  },
  {
    role: 'tenant.secretary',
    name: 'Roberto Almeida',
    title: 'Secretário Municipal de Educação',
    description: 'Visão consolidada da rede, indicadores e EDUCACENSO.',
    icon: 'Landmark',
    scope: 'rede',
  },
  {
    role: 'school.principal',
    name: 'Mariana Costa',
    title: 'Diretora Escolar',
    description: 'Gestão completa da sua unidade — turmas, equipe e matrículas.',
    context: 'E. M. João da Cruz',
    icon: 'Building2',
    scope: 'escola',
  },
  {
    role: 'school.vice_principal',
    name: 'Paulo Henrique',
    title: 'Vice-Diretor',
    description: 'Apoio à direção na rotina e na frequência da unidade.',
    context: 'E. M. João da Cruz',
    icon: 'Users',
    scope: 'escola',
  },
  {
    role: 'school.pedagogical_coordinator',
    name: 'Juliana Reis',
    title: 'Coordenadora Pedagógica',
    description: 'Diários, planos de aula, notas e acompanhamento pedagógico.',
    context: 'E. M. Pe. Augusto',
    icon: 'GraduationCap',
    scope: 'escola',
  },
  {
    role: 'school.secretary',
    name: 'Fernanda Lima',
    title: 'Secretária Escolar',
    description: 'Matrículas, documentos escolares e histórico dos alunos.',
    context: 'E. M. São José',
    icon: 'ClipboardList',
    scope: 'escola',
  },
  {
    role: 'school.teacher',
    name: 'Carlos Mendes',
    title: 'Professor',
    description: 'Diário de classe, frequência e lançamento de notas das turmas.',
    context: 'Turma 5º A',
    icon: 'BookOpen',
    scope: 'escola',
  },
  {
    role: 'guardian',
    name: 'Sandra Oliveira',
    title: 'Responsável',
    description: 'Boletim, frequência, comunicados e calendário do(a) filho(a).',
    context: 'Responsável por Pedro Oliveira',
    icon: 'HeartHandshake',
    scope: 'familia',
  },
  {
    role: 'student',
    name: 'Pedro Oliveira',
    title: 'Aluno',
    description: 'Boletim, materiais, calendário e comunicados da turma.',
    context: 'Turma 5º A',
    icon: 'Backpack',
    scope: 'familia',
  },
];

export function findPersona(role: string): DemoPersona | undefined {
  return DEMO_PERSONAS.find((p) => p.role === role);
}
