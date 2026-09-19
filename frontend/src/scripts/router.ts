import { navigate } from 'astro:transitions/client';
import { currentUser, getToken, read, setToken, post } from '../lib/client';
import { esc } from './dom';
let lifetime: AbortController | undefined;
document.addEventListener('astro:before-swap', () => { lifetime?.abort(); document.querySelectorAll('dialog').forEach(d => d.remove()); });
window.addEventListener('session-expired', () => { if (document.querySelector('[data-protected]')) void navigate('/login/'); });
document.addEventListener('click', async event => {
  const target = event.target as Element;
  if (target.closest('[data-menu-open]')) document.querySelector('.sidebar')?.classList.add('open');
  if (target.closest('[data-menu-close], .sidebar a')) document.querySelector('.sidebar')?.classList.remove('open');
  if (target.closest('[data-logout]')) {
    const button = target.closest('button')!; button.disabled = true;
    try { await post('auth/logout/', {}); }
    catch { /* Local logout remains available when the network is offline. */ }
    finally { setToken(null); button.disabled = false; await navigate('/login/'); }
  }
});
function prefetch(event: Event) {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
  if (!link || link.origin !== location.origin) return;
  const connection = (navigator as Navigator & {connection?:{saveData:boolean}}).connection;
  if (connection?.saveData) return;
  const path = link.pathname;
  const endpoint = path === '/explorar/' ? 'explore/' : getToken() && ['/dashboard/','/dashboard/atividades/','/dashboard/resultados/'].includes(path) ? 'activities/?summary=1' : getToken() && path === '/dashboard/favoritos/' ? 'favorites/' : null;
  if (endpoint) void read(endpoint).catch(() => {});
}
document.addEventListener('pointerover', prefetch);
document.addEventListener('focusin', prefetch);
document.addEventListener('astro:page-load', async () => {
  lifetime?.abort(); lifetime = new AbortController(); const signal = lifetime.signal;
  const root = document.querySelector<HTMLElement>('[data-page]');
  document.querySelectorAll<HTMLAnchorElement>('.sidebar nav a').forEach(a => {
    const active = a.pathname === location.pathname || (a.pathname !== '/dashboard/' && location.pathname.startsWith(a.pathname));
    a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (!root) return;
  let user: import('../lib/types').User | null = null;
  try {
    if (getToken()) user = await currentUser();
    if (signal.aborted) return;
    if (document.querySelector('[data-protected]') && !user) { await navigate('/login/', {history:'replace'}); return; }
    document.querySelectorAll('[data-user-name]').forEach(el => el.innerHTML = esc(user?.name) + '<small>'+(user?.role === 'STUDENT' ? 'Aluno(a)' : 'Educador(a)')+'</small>');
    document.querySelectorAll('[data-avatar]').forEach(el => el.textContent = user?.name.charAt(0).toUpperCase() || '');
    document.querySelectorAll<HTMLElement>('[data-teacher]').forEach(el => el.hidden = user?.role === 'STUDENT');
    const context = {root, signal, user};
    const page = root.dataset.page;
    const module = page === 'auth' ? await import('./auth') : page === 'editor' ? await import('./editor') : page === 'game' ? await import('./game') : page === 'reports' ? await import('./reports') : page === 'ai' || page === 'account' ? await import('./account') : await import('./activities');
    if (!signal.aborted) await module.mount(context);
  } catch (e) {
    if (signal.aborted) return;
    root.innerHTML = '<div class="error" role="alert">'+esc((e as Error).message)+'</div><button class="button" data-retry>Tentar novamente</button>';
    root.querySelector('[data-retry]')?.addEventListener('click', () => document.dispatchEvent(new Event('astro:page-load')), {signal});
  }
});
