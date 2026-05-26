import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Infra Monitoring' };

export default function InfraMonitoringPage() {
  return (
    <main className="flex h-full items-center justify-center px-6">
      <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-sm text-muted-foreground">
        Rota em implementação.
      </p>
    </main>
  );
}
