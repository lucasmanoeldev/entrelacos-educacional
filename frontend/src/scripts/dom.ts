export const esc = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const heading = (title: string, subtitle = '', eyebrow = '') => '<div class="page-heading"><div><p class="eyebrow">'+esc(eyebrow)+'</p><h1>'+esc(title)+'</h1><p class="muted">'+esc(subtitle)+'</p></div></div>';
export const loading = '<div class="loading" role="status">Carregando…</div>';
export function error(root: Element, reason: unknown) { const el = root.querySelector('[data-error]'); if (el) el.textContent = reason instanceof Error ? reason.message : String(reason); }
export function options(values: string[], selected = '') { return values.map(v => '<option'+(v === selected ? ' selected' : '')+'>'+esc(v)+'</option>').join(''); }
export function dialog(title: string, html: string) {
  const el = document.createElement('dialog'); el.className = 'modal';
  el.innerHTML = '<div class="modal-heading"><h2>'+esc(title)+'</h2><button class="icon-button" aria-label="Fechar" data-close>×</button></div>'+html;
  document.body.append(el);
  el.querySelector('[data-close]')!.addEventListener('click', () => el.close());
  el.addEventListener('click', event => { if (event.target === el) el.close(); });
  el.addEventListener('close', () => el.remove(), { once: true });
  el.showModal(); return el;
}
export type Context = { root: HTMLElement; signal: AbortSignal; user: import('../lib/types').User | null };
