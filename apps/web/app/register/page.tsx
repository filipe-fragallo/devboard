import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';
import { Card } from '@/components/ui';

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="mb-6 mt-2 text-sm text-slate-500">
          Comece com boards e tarefas reais.
        </p>
        <AuthForm mode="register" />
        <p className="mt-4 text-sm">
          Já tem conta?{' '}
          <Link className="text-primary" href="/login">
            Entrar
          </Link>
        </p>
      </Card>
    </main>
  );
}
