'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, Textarea } from './ui';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  columnId: z.string(),
});
export type TaskFormValues = z.infer<typeof schema>;

export function TaskForm({
  columnId,
  onSubmit,
  loading,
}: {
  columnId: string;
  onSubmit: (values: TaskFormValues) => void;
  loading?: boolean;
}) {
  const { register, handleSubmit, formState, reset } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { columnId, priority: 'MEDIUM' },
  });
  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((values) => {
        onSubmit(values);
        reset({ columnId, priority: 'MEDIUM' });
      })}
    >
      <Input placeholder="Título da task" {...register('title')} />
      <Textarea placeholder="Descrição" rows={3} {...register('description')} />
      <div className="grid grid-cols-2 gap-3">
        <select
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          {...register('priority')}
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </select>
        <Input type="date" {...register('dueDate')} />
      </div>
      {formState.errors.title?.message && (
        <p className="text-sm text-red-500">{formState.errors.title.message}</p>
      )}
      <Button className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : 'Adicionar task'}
      </Button>
    </form>
  );
}
