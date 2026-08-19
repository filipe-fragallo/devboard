import { ArrowRight, CheckCircle2, Columns3, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          DevBoard
        </Link>
        <div className="flex gap-3 text-sm">
          <Link href="/login">Entrar</Link>
          <Link
            className="rounded-lg bg-foreground px-3 py-2 text-background"
            href="/register"
          >
            Criar conta
          </Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-6xl gap-12 py-20 lg:grid-cols-[1fr_520px] lg:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-border px-3 py-1 text-sm text-primary">
            Kanban profissional com escopo controlado
          </p>
          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
            Gerencie projetos com clareza, prioridade e fluxo real.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            DevBoard combina uma experiência Kanban limpa com API segura,
            autenticação real e persistência PostgreSQL para demonstrar
            engenharia full stack de ponta a ponta.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-white"
              href="/register"
            >
              Criar conta <ArrowRight size={18} />
            </Link>
            <Link
              className="rounded-lg border border-border px-5 py-3 font-medium"
              href="/login"
            >
              Entrar
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-muted/50 p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-medium">Sprint Board</span>
            <span className="text-xs text-slate-500">DevBoard Preview</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {['Backlog', 'Em andamento', 'Concluído'].map((column, index) => (
              <div
                key={column}
                className="rounded-xl border border-border bg-background p-3"
              >
                <h3 className="mb-3 font-medium">{column}</h3>
                <div className="space-y-2">
                  {['API auth', 'Kanban DnD', 'Docs']
                    .slice(index, index + 2)
                    .map((task) => (
                      <div
                        key={task}
                        className="rounded-lg border border-border p-3 shadow-sm"
                      >
                        <p>{task}</p>
                        <span className="mt-2 inline-block rounded bg-muted px-2 py-1 text-xs">
                          HIGH
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {[
          {
            icon: Columns3,
            title: 'Fluxo persistente',
            text: 'Reordenação e movimentação salvas no backend.',
          },
          {
            icon: Lock,
            title: 'Segurança real',
            text: 'JWT, refresh token com hash e ownership por consulta.',
          },
          {
            icon: CheckCircle2,
            title: 'Qualidade',
            text: 'Testes, lint, typecheck, CI e documentação técnica.',
          },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-xl border border-border p-6">
            <Icon className="mb-4 text-primary" />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {text}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
