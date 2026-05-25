'use client';

import { useRouter } from 'next/navigation';
import * as Icons from 'lucide-react';
import { DEMO_PERSONAS, DEMO_TENANT, type DemoPersona, type PersonaScope } from '@/data/personas';
import { setDemoRole } from '@/lib/use-demo-session';
import { cn } from '@/lib/utils';

const SCOPES: { key: PersonaScope; label: string; hint: string }[] = [
  { key: 'rede', label: 'Rede municipal', hint: 'Secretaria de Educação' },
  { key: 'escola', label: 'Unidade escolar', hint: 'Direção, coordenação e docentes' },
  { key: 'familia', label: 'Família', hint: 'Responsáveis e alunos' },
];

function Icon({ name, className }: { name: string; className?: string }) {
  const C =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ??
    Icons.User;
  return <C className={className} />;
}

export default function LoginPage() {
  const router = useRouter();

  function enter(persona: DemoPersona) {
    setDemoRole(persona.role);
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-10 lg:py-16">
        {/* Marca + tenant */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Ambiente de demonstração
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">
            Educari <span className="text-muted-foreground font-normal">· Gestão Educacional</span>
          </h1>
          <div className="mt-4 inline-flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icons.Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{DEMO_TENANT.name}</p>
              <p className="text-xs text-muted-foreground">
                {DEMO_TENANT.institutional_name}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Escolha um perfil para explorar o sistema sob aquele papel.
          </p>
        </header>

        {/* Personas agrupadas por escopo */}
        <div className="space-y-8">
          {SCOPES.map((scope) => {
            const personas = DEMO_PERSONAS.filter((p) => p.scope === scope.key);
            return (
              <section key={scope.key}>
                <div className="mb-3 flex items-baseline gap-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {scope.label}
                  </h2>
                  <span className="text-xs text-muted-foreground/70">· {scope.hint}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {personas.map((p) => (
                    <button
                      key={p.role}
                      onClick={() => enter(p)}
                      className={cn(
                        'group flex items-start gap-3 rounded-lg border bg-card p-4 text-left',
                        'transition-all hover:border-primary/50 hover:shadow-md focus:outline-none',
                        'focus-visible:ring-2 focus-visible:ring-primary',
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon name={p.icon} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.name}</p>
                        {p.context && (
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">
                            {p.context}
                          </p>
                        )}
                        <p className="mt-2 text-xs leading-snug text-muted-foreground">
                          {p.description}
                        </p>
                      </div>
                      <Icons.ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          <p>
            Demonstração sem autenticação real · os perfis usam os papéis (roles) do
            RBAC do Educari. Integração OAuth (Passport) conecta na sequência.
          </p>
        </footer>
      </div>
    </div>
  );
}
