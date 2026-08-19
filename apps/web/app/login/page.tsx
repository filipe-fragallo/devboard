import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { Card } from '@/components/ui';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Entrar no DevBoard</h1>
        <p className="mb-6 mt-2 text-sm text-slate-500">
          Use sua conta para acessar seus boards.
        </p>
        <AuthForm mode="login" />
        <p className="mt-4 text-sm">
          Novo por aqui?{' '}
          <Link className="text-primary" href="/register">
            Criar conta
          </Link>
        </p>
      </Card>
    </main>
  );
}
