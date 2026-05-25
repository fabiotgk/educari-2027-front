import { Topbar } from '@/components/dashboard/topbar';

/** Fallback quando o papel não tem dashboard específico. */
export default function DefaultDashboard() {
  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Início' }]} />
      <main className="flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">Bem-vindo ao Educari</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu painel será exibido aqui conforme o seu perfil de acesso.
          </p>
        </div>
      </main>
    </>
  );
}
