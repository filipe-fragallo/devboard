import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AuthForm } from './auth-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('AuthForm', () => {
  it('shows validation errors on invalid login', async () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <AuthForm mode="login" />
      </QueryClientProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
