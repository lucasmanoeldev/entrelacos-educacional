import { navigate } from 'astro:transitions/client';
import { post, setToken } from '../lib/client';
import { esc, error, type Context } from './dom';
export function mount({root, signal}: Context) {
  const mode = root.dataset.mode || 'login';
  const titles: Record<string,string> = {login:'Bom ter você por aqui.',register:'Toda descoberta começa com uma ideia.',forgot:'Vamos recuperar seu acesso.',reset:'Uma nova senha, um novo começo.'};
  const labels: Record<string,string> = {login:'Entrar na minha conta →',register:'Criar minha conta →',forgot:'Enviar instruções',reset:'Salvar nova senha'};
  root.className = 'auth-page';
  root.innerHTML = '<aside class="auth-art"><a href="/" class="brand">✳ entrelaços.</a><div><span class="eyebrow">ENSINAR É CONECTAR</span><h1>Pequenas ideias.<br/>Grandes<br/><em>descobertas.</em></h1><p>Seu conteúdo ganha vida.<br/>A aprendizagem ganha novos caminhos.</p></div><span>Feito para quem transforma a educação.</span></aside><section class="auth-form"><a class="back-link" href="/">← Voltar ao início</a><h2>'+titles[mode]+'</h2><p class="muted">Seu espaço de aprendizagem está aqui.</p><div class="error" data-error role="alert"></div><div data-success></div><form>' +
    (mode === 'register' ? '<label>Seu nome<input name="name" autocomplete="name" required maxlength="80"/></label>' : '') +
    (mode !== 'reset' ? '<label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="150"/></label>' : '') +
    (mode !== 'forgot' ? '<label>Senha<input name="password" type="password" autocomplete="'+(mode === 'login' ? 'current-password' : 'new-password')+'" minlength="'+(mode === 'login' ? 1 : 10)+'" maxlength="128" required/></label>' : '') +
    (['register','reset'].includes(mode) ? '<label>Confirme a senha<input name="confirm" type="password" autocomplete="new-password" required/></label>' : '') +
    (mode === 'register' ? '<label>Como você participa?<select name="role"><option value="TEACHER">Sou professor(a)</option><option value="STUDENT">Sou aluno(a)</option><option value="SCHOOL_ADMIN">Represento uma escola</option></select></label><p class="small-text">Alunos podem jogar com um apelido, sem criar conta.</p>' : '') +
    '<button class="button full">'+labels[mode]+'</button>'+(mode === 'login' ? '<a href="/esqueci-senha/" class="subtle-link">Esqueci minha senha</a>' : '')+'</form><p class="auth-switch">'+(mode === 'login' ? 'Ainda não tem conta? <a href="/cadastro/">Comece por aqui</a>' : '<a href="/login/">Já tenho uma conta</a>')+'</p></section>';
  root.querySelector('form')!.addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget as HTMLFormElement, button = form.querySelector('button')!;
    button.disabled = true; button.textContent = 'Aguarde…'; error(root,'');
    const data = Object.fromEntries(new FormData(form));
    try {
      if (['register','reset'].includes(mode) && data.password !== data.confirm) throw new Error('As senhas precisam ser iguais.');
      if (['forgot','reset'].includes(mode)) {
        const query = new URLSearchParams(location.search);
        const result = await post<{detail:string}>('auth/'+(mode === 'forgot' ? 'forgot-password' : 'reset-password')+'/', {...data, uid:query.get('uid'),token:query.get('token')},undefined,signal);
        if (signal.aborted) return;
        form.hidden = true; root.querySelector('[data-success]')!.innerHTML = '<div class="success">'+esc(result.detail)+'<p><a href="/login/">Voltar para entrar</a></p></div>';
      } else {
        const result = await post<{token:string}>('auth/'+(mode === 'login' ? 'login' : 'register')+'/',data,undefined,signal);
        if (signal.aborted) return;
        setToken(result.token); await navigate('/dashboard/');
      }
    } catch (e) { if (!signal.aborted) error(root,e); }
    finally { button.disabled = false; button.textContent = labels[mode]; }
  },{signal});
}
