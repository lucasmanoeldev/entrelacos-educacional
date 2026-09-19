import type { User } from './types';
const BASE = (import.meta.env.PUBLIC_API_URL || import.meta.env.PUBLIC_LEGACY_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
type Entry = { value?: unknown; until: number; pending?: Promise<unknown> };
const cache = new Map<string, Entry>();
let generation = 0;
export function invalidate() { generation++; cache.clear(); }
export function getToken() { return sessionStorage.getItem('entrelacos-token'); }
export function setToken(token: string | null) {
  invalidate();
  if (token) sessionStorage.setItem('entrelacos-token', token);
  else { sessionStorage.removeItem('entrelacos-token'); sessionStorage.removeItem('entrelacos-ai-draft'); }
}
function message(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(message).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(message).join(' ');
  return 'Não foi possível concluir. Tente novamente.';
}
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken(), headers = new Headers(options.headers);
  if (token) headers.set('Authorization', 'Bearer ' + token);
  if (options.body) headers.set('Content-Type', 'application/json');
  let response: Response;
  try { response = await fetch(BASE + '/' + path.replace(/^\//, ''), { ...options, headers, cache: 'no-store', signal: options.signal || AbortSignal.timeout(70000) }); }
  catch (e) { if (options.signal?.aborted) throw e; throw new Error('Não foi possível conectar. Verifique sua conexão e tente novamente.'); }
  if (response.status === 401 && token === getToken()) { setToken(null); window.dispatchEvent(new Event('session-expired')); }
  if (response.status === 204) { invalidate(); return undefined as T; }
  const body = await response.json().catch(() => ({ error: 'O serviço está indisponível no momento.' }));
  if (!response.ok) throw new Error(message(body.error || body));
  if (options.method && options.method !== 'GET') invalidate();
  return body as T;
}
// Only explicitly safe GET endpoints enter this bounded, per-tab, per-session cache.
export function read<T>(path: string, ttl = 30000): Promise<T> {
  const key = (getToken() || 'guest') + ':' + path, existing = cache.get(key);
  if (existing?.pending) return existing.pending as Promise<T>;
  if (existing && existing.until > Date.now()) return Promise.resolve(existing.value as T);
  const version = generation;
  const pending = api<T>(path).then(value => {
    if (generation === version) { cache.delete(key); cache.set(key, { value, until: Date.now() + ttl }); }
    return value;
  }).catch(error => { if (generation === version) cache.delete(key); throw error; });
  if (cache.size >= 40) cache.delete(cache.keys().next().value!);
  cache.set(key, { pending, until: 0 });
  return pending;
}
export const post = <T>(path: string, data: unknown, headers?: Record<string,string>, signal?: AbortSignal) => api<T>(path, { method: 'POST', body: JSON.stringify(data), headers, signal });
export const currentUser = () => getToken() ? read<User>('auth/me/', 30000) : Promise.resolve(null);
