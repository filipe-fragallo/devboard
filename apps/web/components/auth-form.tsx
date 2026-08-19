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
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter uma letra maiúscula')
      .regex(/[0-9]/, 'A senha deve conter um número'),
    confirmPassword: z
      .string()
      .min(8, 'A confirmação deve ter pelo menos 8 caracteres'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas devem ser iguais',
    path: ['confirmPassword'],
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();

  const schema = mode === 'login' ? loginSchema : registerSchema;

  const { register, handleSubmit, formState } = useForm<
    LoginForm | RegisterForm
  >({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginForm | RegisterForm) => {
      let payload;

      if (mode === 'register') {
        const { confirmPassword, ...registerPayload } = values as RegisterForm;

        payload = registerPayload;
      } else {
        payload = values;
      }

      return api<{ accessToken: string; refreshToken: string }>(
        `/auth/${mode}`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },

    onSuccess: (tokens) => {
      setSession(tokens);
      toast.success(
        mode === 'login' ? 'Sessão iniciada' : 'Conta criada com sucesso',
      );
      router.push('/dashboard');
    },

    onError: (error) => {
      toast.error(error.message);
    },
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
