'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/app-shell';
import { Protected } from '@/components/protected';
import { Button, Card, Input } from '@/components/ui';
import { api } from '@/lib/api';
import type { Board } from '@/lib/types';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const boards = useQuery({
    queryKey: ['boards'],
    queryFn: () => api<Board[]>('/boards'),
  });
  const create = useMutation({
    mutationFn: () =>
      api<Board>('/boards', { method: 'POST', body: JSON.stringify({ name }) }),
    onSuccess: () => {
      setName('');
      void queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Board criado');
    },
    onError: (e) => toast.error(e.message),
  });
  const data = boards.data ?? [];
  const tasks = data.flatMap((b) => b.columns.flatMap((c) => c.tasks));
  const done = data.flatMap((b) =>
    b.columns
      .filter((c) => c.name.toLowerCase().includes('concl'))
      .flatMap((c) => c.tasks),
  );
  return (
    <Protected>
      <AppShell>
        <div className="space-y-8">
          <section>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-slate-500">
              Resumo dos seus projetos e tarefas.
            </p>
          </section>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Boards', data.length],
              ['Tasks', tasks.length],
              ['Pendentes', tasks.length - done.length],
              ['Concluídas', done.length],
            ].map(([label, value]) => (
              <Card key={label} className="p-5">
                <p className="text-sm text-slate-500">{label}</p>
                <strong className="text-3xl">{value}</strong>
              </Card>
            ))}
          </div>
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Novo Board</h2>
            <div className="flex gap-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do board"
              />
              <Button
                disabled={!name || create.isPending}
                onClick={() => create.mutate()}
              >
                Criar
              </Button>
            </div>
          </Card>
          <section>
            <h2 className="mb-4 font-semibold">Boards recentes</h2>
            {boards.isLoading ? (
              <Card className="p-6">Carregando boards...</Card>
            ) : data.length === 0 ? (
              <Card className="p-6">
                Nenhum board ainda. Crie o primeiro para começar.
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {data.map((board) => (
                  <Link key={board.id} href={`/boards/${board.id}`}>
                    <Card className="p-5 transition hover:border-primary">
                      <h3 className="font-medium">{board.name}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {board.columns.length} colunas
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </Protected>
  );
}
