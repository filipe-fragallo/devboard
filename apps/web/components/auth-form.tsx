'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { api, setSession } from '@/lib/api';
import { Button, Input } from './ui';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
const registerSchema = loginSchema
  .extend({ name: z.string().min(2), confirmPassword: z.string().min(8) })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'As senhas devem ser iguais',
    path: ['confirmPassword'],
  });

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const schema = mode === 'login' ? loginSchema : registerSchema;
  const { register, handleSubmit, formState } = useForm<z.infer<typeof schema>>(
    { resolver: zodResolver(schema) },
  );
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      api<{ accessToken: string; refreshToken: string }>(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: (tokens) => {
      setSession(tokens);
      toast.success('Sessão iniciada');
      router.push('/dashboard');
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
    >
      {mode === 'register' && (
        <Input placeholder="Nome" {...register('name' as never)} />
      )}
      <Input placeholder="Email" type="email" {...register('email')} />
      <Input placeholder="Senha" type="password" {...register('password')} />
      {mode === 'register' && (
        <Input
          placeholder="Confirmar senha"
          type="password"
          {...register('confirmPassword' as never)}
        />
      )}
      {Object.values(formState.errors)[0]?.message && (
        <p className="text-sm text-red-500">
          {String(Object.values(formState.errors)[0]?.message)}
        </p>
      )}
      <Button disabled={mutation.isPending} className="w-full">
        {mutation.isPending
          ? 'Carregando...'
          : mode === 'login'
            ? 'Entrar'
            : 'Criar conta'}
      </Button>
    </form>
  );
}
