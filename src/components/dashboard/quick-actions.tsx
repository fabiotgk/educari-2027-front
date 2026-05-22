'use client';

import Link from 'next/link';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/lib/providers/tenant-provider';

interface QuickAction {
  label: string;
  description: string;
  icon: keyof typeof Icons;
  href: string;
  module: string;
}

const ACTIONS: QuickAction[] = [
  {
    label: 'Nova matrícula',
    description: 'Matricular aluno em turma com vaga',
    icon: 'UserPlus',
    href: '/matriculas/nova',
    module: 'M03',
  },
  {
    label: 'Lançar notas',
    description: 'Diário de classe online',
    icon: 'BookOpen',
    href: '/diario',
    module: 'M04',
  },
  {
    label: 'Gerar boletins',
    description: 'Boletim do período em lote',
    icon: 'FileText',
    href: '/notas/boletim',
    module: 'M07',
  },
  {
    label: 'Enviar comunicado',
    description: 'Push + e-mail para responsáveis',
    icon: 'Send',
    href: '/comunicacao/novo',
    module: 'M11',
  },
];

export function QuickActions() {
  const { isModuleEnabled } = useTenant();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ações rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACTIONS.map((action) => {
          const enabled = isModuleEnabled(action.module);
          const IconComponent = (Icons[action.icon] as React.ComponentType<{ className?: string }>) ?? Icons.Square;

          return (
            <Button
              key={action.href}
              variant="outline"
              asChild={enabled}
              disabled={!enabled}
              className="h-auto justify-start gap-3 p-4 text-left"
            >
              {enabled ? (
                <Link href={action.href}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-medium">{action.label}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {action.description}
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="flex w-full items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="text-sm font-medium">{action.label}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Módulo não contratado
                    </span>
                  </div>
                </div>
              )}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
