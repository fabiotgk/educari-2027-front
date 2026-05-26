'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Loader2, Lock, UserRound, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { applyApiErrors } from '@/lib/form';
import { usePortalAuth } from '@/lib/providers/portal-auth-provider';
import { toastError } from '@/lib/toast';

const portalLoginSchema = z.object({
  tenant_slug: z
    .string()
    .min(1, 'O tenant é obrigatório.')
    .max(63, 'O tenant não pode exceder 63 caracteres.'),
  login: z
    .string()
    .min(1, 'O login é obrigatório.')
    .max(255, 'O login não pode exceder 255 caracteres.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.')
    .max(255, 'A senha não pode exceder 255 caracteres.'),
});

type PortalLoginForm = z.infer<typeof portalLoginSchema>;

export function PortalLoginPage() {
  const router = useRouter();
  const { login } = usePortalAuth();
  const form = useForm<PortalLoginForm>({
    resolver: zodResolver(portalLoginSchema),
    defaultValues: {
      tenant_slug: 'mariana',
      login: '',
      password: '',
    },
  });

  async function onSubmit(values: PortalLoginForm) {
    try {
      await login(values);
      router.push('/portal');
    } catch (error) {
      const applied = applyApiErrors(error, form.setError);
      toastError(error, applied ? 'Verifique os campos destacados.' : 'Não foi possível entrar.');
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <main className="bg-muted/30 min-h-screen overflow-auto">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-primary text-primary-foreground hidden lg:flex">
          <div className="flex h-full w-full flex-col justify-between p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">Educari</span>
            </div>
            <div className="max-w-lg">
              <p className="mb-3 text-sm font-medium text-white/70">Portal Web do Cidadão</p>
              <h1 className="text-4xl leading-tight font-semibold">
                Boletim, frequência e comunicados em um só acesso.
              </h1>
              <p className="mt-4 text-sm leading-6 text-white/75">
                Área pública para responsáveis e alunos acompanharem a vida escolar com credenciais
                próprias do portal.
              </p>
            </div>
            <p className="text-xs text-white/60">M12 · Portal do Aluno e Família</p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">Portal do Cidadão</span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Acessar portal</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tenant_slug">Tenant</Label>
                    <div className="relative">
                      <Building2 className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        id="tenant_slug"
                        autoComplete="organization"
                        className="h-10 pl-9"
                        aria-invalid={Boolean(form.formState.errors.tenant_slug)}
                        {...form.register('tenant_slug')}
                      />
                    </div>
                    {form.formState.errors.tenant_slug && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.tenant_slug.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="login">Login</Label>
                    <div className="relative">
                      <UserRound className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        id="login"
                        autoComplete="username"
                        className="h-10 pl-9"
                        placeholder="CPF, e-mail ou usuário"
                        aria-invalid={Boolean(form.formState.errors.login)}
                        {...form.register('login')}
                      />
                    </div>
                    {form.formState.errors.login && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.login.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className="h-10 pl-9"
                        aria-invalid={Boolean(form.formState.errors.password)}
                        {...form.register('password')}
                      />
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="h-10 w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
