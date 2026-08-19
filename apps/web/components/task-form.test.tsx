import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TaskForm } from './task-form';

describe('TaskForm', () => {
  it('submits a valid task payload', async () => {
    const onSubmit = vi.fn();
    render(<TaskForm columnId="c1" onSubmit={onSubmit} />);
    await userEvent.type(
      screen.getByPlaceholderText(/título/i),
      'Configurar CI',
    );
    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Configurar CI',
        columnId: 'c1',
        priority: 'MEDIUM',
      }),
    );
  });
});
