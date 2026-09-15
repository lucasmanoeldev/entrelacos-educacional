const BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
export function getToken() { return typeof window === 'undefined' ? null : sessionStorage.getItem('entrelacos-token'); }
export function setToken(token: string | null) { if (token) sessionStorage.setItem('entrelacos-token', token); else sessionStorage.removeItem('entrelacos-token'); }
function message(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(message).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(message).join(' ');
  return 'Não foi possível concluir. Tente novamente.';
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${BASE}/${path.replace(/^\//, '')}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }, signal: options.signal || AbortSignal.timeout(70000) });
  } catch { throw new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.'); }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({ error: 'O serviço está indisponível no momento.' }));
  if (!response.ok) { if (response.status === 401) setToken(null); throw new Error(message(body.error || body)); }
  return body as T;
}
export const post = <T,>(path: string, data: unknown, headers?: Record<string, string>, signal?: AbortSignal) => api<T>(path, { method: 'POST', body: JSON.stringify(data), headers, signal });
