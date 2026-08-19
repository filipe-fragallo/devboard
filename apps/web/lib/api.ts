const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('devboard.accessToken');
}

export function setSession(tokens: {
  accessToken: string;
  refreshToken: string;
}) {
  window.localStorage.setItem('devboard.accessToken', tokens.accessToken);
  window.localStorage.setItem('devboard.refreshToken', tokens.refreshToken);
}

export function clearSession() {
  window.localStorage.removeItem('devboard.accessToken');
  window.localStorage.removeItem('devboard.refreshToken');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && typeof window !== 'undefined') clearSession();
  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(
      Array.isArray(body.message)
        ? body.message.join(', ')
        : (body.message ?? 'Request failed'),
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
