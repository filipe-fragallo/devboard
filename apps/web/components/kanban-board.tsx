'use client';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Board, Priority, Task } from '@/lib/types';
import { Card, Input } from './ui';
import { TaskForm, TaskFormValues } from './task-form';

function priorityClass(priority: Priority) {
  return {
    LOW: 'bg-slate-100 text-slate-700 dark:bg-slate-800',
    MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-950',
    HIGH: 'bg-amber-100 text-amber-800 dark:bg-amber-950',
    URGENT: 'bg-red-100 text-red-700 dark:bg-red-950',
  }[priority];
}

function SortableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id, data: { type: 'task', task } });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-lg border border-border bg-background p-3 shadow-sm active:cursor-grabbing"
    >
      <p className="font-medium">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {task.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${priorityClass(task.priority)}`}
        >
          {task.priority}
        </span>
        {task.dueDate && (
          <span className="text-xs text-slate-500">
            {new Date(task.dueDate).toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ board }: { board: Board }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState<'ALL' | Priority>('ALL');
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const createTask = useMutation({
    mutationFn: (values: TaskFormValues) =>
      api<Task>('/tasks', { method: 'POST', body: JSON.stringify(values) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['board', board.id] });
      toast.success('Task criada');
    },
    onError: (e) => toast.error(e.message),
  });
  const moveTask = useMutation({
    mutationFn: ({
      taskId,
      targetColumnId,
      position,
    }: {
      taskId: string;
      targetColumnId: string;
      position: number;
    }) =>
      api<Task>(`/tasks/${taskId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ targetColumnId, position }),
      }),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ['board', board.id] }),
    onError: (e) => {
      toast.error(e.message);
      void queryClient.invalidateQueries({ queryKey: ['board', board.id] });
    },
  });
  const filtered = useMemo(
    () =>
      board.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(search.toLowerCase()) &&
            (priority === 'ALL' || task.priority === priority),
        ),
      })),
    [board.columns, priority, search],
  );

  function onDragEnd(event: DragEndEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    if (!task || !event.over) return;
    const overTask = event.over.data.current?.task as Task | undefined;
    const targetColumn = board.columns.find(
      (column) => column.id === (overTask?.columnId ?? event.over?.id),
    );
    if (!targetColumn) return;
    const position = overTask
      ? targetColumn.tasks.findIndex((item) => item.id === overTask.id)
      : targetColumn.tasks.length;
    moveTask.mutate({
      taskId: task.id,
      targetColumnId: targetColumn.id,
      position: Math.max(0, position),
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={16}
          />
          <Input
            className="pl-9"
            placeholder="Pesquisar por título"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'ALL' | Priority)}
        >
          <option value="ALL">Todas prioridades</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-4 overflow-x-auto md:grid-cols-3">
          {filtered.map((column) => (
            <Card key={column.id} className="min-h-[460px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{column.name}</h2>
                <span className="rounded-full bg-muted px-2 py-1 text-xs">
                  {column.tasks.length}
                </span>
              </div>
              <SortableContext
                items={column.tasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div id={column.id} className="space-y-3">
                  {column.tasks.map((task) => (
                    <SortableTask key={task.id} task={task} />
                  ))}
                  {column.tasks.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-slate-500">
                      Sem tasks nesta coluna.
                    </div>
                  )}
                </div>
              </SortableContext>
              <div className="mt-4 border-t border-border pt-4">
                <TaskForm
                  columnId={column.id}
                  loading={createTask.isPending}
                  onSubmit={(values) => createTask.mutate(values)}
                />
              </div>
            </Card>
          ))}
        </div>
      </DndContext>
      {moveTask.isPending && (
        <p className="text-sm text-slate-500">Salvando nova posição...</p>
      )}
    </div>
  );
}
