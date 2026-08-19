import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="text-4xl font-semibold">Página não encontrada</h1>
        <p className="mt-3 text-slate-500">
          A rota solicitada não existe no DevBoard.
        </p>
        <Link
          className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-white"
          href="/dashboard"
        >
          Voltar ao dashboard
        </Link>
      </div>
    </main>
  );
}
