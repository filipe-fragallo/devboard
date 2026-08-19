'use client';

import { LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearSession } from '@/lib/api';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r border-border p-5 md:block">
        <Link href="/dashboard" className="text-lg font-semibold">
          DevBoard
        </Link>
        <nav className="mt-8">
          <Link
            className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
            href="/dashboard"
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-4">
          <span className="font-medium md:hidden">DevBoard</span>
          <div className="ml-auto flex gap-2">
            <button
              aria-label="Alternar tema"
              className="rounded-lg border border-border p-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              aria-label="Sair"
              className="rounded-lg border border-border p-2"
              onClick={() => {
                clearSession();
                router.push('/login');
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
