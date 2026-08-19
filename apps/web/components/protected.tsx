'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAccessToken } from '@/lib/api';

export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getAccessToken()) router.replace('/login');
    else setReady(true);
  }, [router]);
  if (!ready)
    return (
      <div className="rounded-xl border border-border p-6">
        Carregando sessão...
      </div>
    );
  return children;
}
