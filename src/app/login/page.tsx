'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
} from 'lucide-react';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Contas reais (seedadas no backend) para acesso rápido na demonstração. */
const QUICK_ACCESS: { label: string; email: string }[] = [
  { label: 'Secretário Municipal', email: 'secretaria@mariana.mg.gov.br' },
  { label: 'Diretor', email: 'diretor@mariana.mg.gov.br' },
  { label: 'Coordenador', email: 'coordenacao@mariana.mg.gov.br' },
  { label: 'Professor', email: 'professor@mariana.mg.gov.br' },
  { label: 'Responsável', email: 'responsavel@mariana.mg.gov.br' },
  { label: 'Administrador', email: 'admin@mariana.mg.gov.br' },
];
const QUICK_PASSWORD = 'educari123';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState<string | null>(null); // null | 'form' | email
  const [error, setError] = useState<string | null>(null);

  async function doLogin(em: string, pw: string, key: string) {
    setError(null);
    setLoading(key);
    try {
      await login(em.trim(), pw);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao entrar.');
      setLoading(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* ───────────── Hero institucional (esquerda) ───────────── */}
      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden lg:flex">
        <div className="gradient-hero absolute inset-0" />

        <svg className="absolute inset-0 h-full w-full opacity-[0.16]" aria-hidden>
          <defs>
            <pattern id="net" width="56" height="56" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="white" />
              <path d="M3 3 L56 3 M3 3 L3 56" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#net)" />
        </svg>

        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />

        <svg
          className="absolute bottom-0 left-0 w-full text-black/30"
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g fill="currentColor">
            <rect x="0" y="120" width="60" height="80" />
            <rect x="64" y="90" width="44" height="110" />
            <rect x="112" y="140" width="52" height="60" />
            <rect x="168" y="70" width="40" height="130" />
            <rect x="212" y="110" width="58" height="90" />
            <rect x="274" y="135" width="46" height="65" />
            <rect x="324" y="100" width="72" height="100" />
            <polygon points="324,100 360,72 396,100" />
            <rect x="400" y="60" width="38" height="140" />
            <rect x="442" y="115" width="56" height="85" />
            <rect x="502" y="85" width="44" height="115" />
            <rect x="550" y="130" width="60" height="70" />
            <rect x="614" y="95" width="42" height="105" />
            <rect x="660" y="120" width="54" height="80" />
            <rect x="718" y="80" width="40" height="120" />
            <rect x="762" y="130" width="38" height="70" />
          </g>
          <g fill="#FFC24D" opacity="0.85">
            <rect x="76" y="104" width="6" height="6" />
            <rect x="178" y="86" width="6" height="6" />
            <rect x="410" y="76" width="6" height="6" />
            <rect x="514" y="100" width="6" height="6" />
            <rect x="728" y="96" width="6" height="6" />
          </g>
        </svg>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Educari</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-[2.1rem] font-semibold leading-[1.15] tracking-tight">
              A rede municipal de ensino, conectada em uma só plataforma.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Da secretaria à sala de aula — matrícula, diário, frequência,
              boletim, transporte e merenda em um só lugar.
            </p>
          </div>

          <p className="text-xs text-white/45">Educari · Sistema de Gestão Educacional</p>
        </div>
      </aside>

      {/* ───────────── Acesso (direita) ───────────── */}
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Educari</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight">Acessar o sistema</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Entre com as credenciais da sua conta.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              doLogin(email, password, 'form');
            }}
            className="mt-8 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.gov.br"
                  className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Esqueci minha senha
                </a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="h-11 w-full" disabled={loading !== null}>
              {loading === 'form' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* ───────────── Acesso rápido ───────────── */}
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Zap className="h-3 w-3" /> Acesso rápido
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {QUICK_ACCESS.map((q) => (
                <Button
                  key={q.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={loading !== null}
                  onClick={() => doLogin(q.email, QUICK_PASSWORD, q.email)}
                  className="h-9 justify-start text-xs font-normal"
                >
                  {loading === q.email ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="truncate">{q.label}</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground/70">
            Educari · Gestão Educacional · Mariana — MG
          </p>
        </div>
      </main>
    </div>
  );
}
