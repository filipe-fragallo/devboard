'use client';

import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/app-shell';
import { KanbanBoard } from '@/components/kanban-board';
import { Protected } from '@/components/protected';
import { Card } from '@/components/ui';
import { api } from '@/lib/api';
import type { Board } from '@/lib/types';

export function BoardClient({ id }: { id: string }) {
  const board = useQuery({
    queryKey: ['board', id],
    queryFn: () => api<Board>(`/boards/${id}`),
  });
  return (
    <Protected>
      <AppShell>
        {board.isLoading && <Card className="p-6">Carregando board...</Card>}
        {board.isError && (
          <Card className="p-6 text-red-500">
            Não foi possível carregar o board.
          </Card>
        )}
        {board.data && (
          <div className="space-y-6">
            <section>
              <h1 className="text-3xl font-semibold">{board.data.name}</h1>
              <p className="text-slate-500">
                {board.data.description ??
                  'Organize tarefas por status, prioridade e prazo.'}
              </p>
            </section>
            <KanbanBoard board={board.data} />
          </div>
        )}
      </AppShell>
    </Protected>
  );
}
