'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, post, setToken } from '@/lib/api';
import { User } from '@/lib/types';
import { Brand, ErrorMessage } from './ui';
import Link from 'next/link';
const AuthContext = createContext<{ user: User | null; loading: boolean; reload: () => Promise<void>; logout: () => Promise<void> }>({ user: null, loading: true, reload: async () => {}, logout: async () => {} });
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  const reload = async () => { try { setUser(getToken() ? await api<User>('auth/me/') : null); } catch { setUser(null); } finally { setLoading(false); } };
  useEffect(() => { void reload(); }, []);
  const logout = async () => { await post('auth/logout/', {}); setToken(null); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, reload, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export function AuthForm({ mode }: { mode: 'login' | 'register' | 'forgot' | 'reset' }) {
  const { reload } = useAuth(); const router = useRouter(); const [error, setError] = useState(''); const [success, setSuccess] = useState(''); const [busy, setBusy] = useState(false);
  const title = { login: 'Bom ter você por aqui.', register: 'Toda descoberta começa com uma ideia.', forgot: 'Vamos recuperar seu acesso.', reset: 'Uma nova senha, um novo começo.' }[mode];
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if ((mode === 'register' || mode === 'reset') && data.password !== data.confirm) throw new Error('As senhas precisam ser iguais.');
      if (mode === 'forgot' || mode === 'reset') {
        const query = new URLSearchParams(window.location.search);
        const result = await post<{ detail: string }>(`auth/${mode === 'forgot' ? 'forgot-password' : 'reset-password'}/`, { ...data, uid: query.get('uid'), token: query.get('token') }); setSuccess(result.detail);
      } else {
        const result = await post<{ token: string }>(`auth/${mode === 'login' ? 'login' : 'register'}/`, data); setToken(result.token); await reload(); router.push('/dashboard/');
      }
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <main className="auth-page"><aside className="auth-art"><Brand/><div><span className="eyebrow">ENSINAR É CONECTAR</span><h1>Pequenas ideias.<br/>Grandes<br/><em>descobertas.</em></h1><p>Seu conteúdo ganha vida.<br/>A aprendizagem ganha novos caminhos.</p></div><span>Feito para quem transforma a educação.</span></aside><section className="auth-form"><Link className="back-link" href="/">← Voltar ao início</Link><h2>{title}</h2><p className="muted">{mode === 'register' ? 'Crie sua conta gratuita e prepare a próxima descoberta.' : 'Seu espaço de aprendizagem está aqui.'}</p><ErrorMessage message={error}/>{success ? <div className="success">{success}<p><Link href="/login/">Voltar para entrar</Link></p></div> : <form onSubmit={submit}>
    {mode === 'register' && <label>Seu nome<input name="name" autoComplete="name" required maxLength={80}/></label>}
    {mode !== 'reset' && <label>E-mail<input name="email" type="email" autoComplete="email" required maxLength={150}/></label>}
    {mode !== 'forgot' && <label>Senha<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? 1 : 10} maxLength={128} required/><small>{mode !== 'login' && 'Use ao menos 10 caracteres. Evite senhas comuns.'}</small></label>}
    {(mode === 'register' || mode === 'reset') && <label>Confirme a senha<input name="confirm" type="password" autoComplete="new-password" required/></label>}
    {mode === 'register' && <><label>Como você participa?<select name="role"><option value="TEACHER">Sou professor(a)</option><option value="STUDENT">Sou aluno(a)</option><option value="SCHOOL_ADMIN">Represento uma escola</option></select></label><p className="small-text">Use apenas os dados necessários. Alunos podem jogar com um apelido, sem criar conta.</p></>}
    <button className="button full" disabled={busy}>{busy ? 'Aguarde…' : { login: 'Entrar na minha conta →', register: 'Criar minha conta →', forgot: 'Enviar instruções', reset: 'Salvar nova senha' }[mode]}</button>
    {mode === 'login' && <Link href="/esqueci-senha/" className="subtle-link">Esqueci minha senha</Link>}
    </form>}<p className="auth-switch">{mode === 'login' ? <>Ainda não tem conta? <Link href="/cadastro/">Comece por aqui</Link></> : <Link href="/login/">Já tenho uma conta</Link>}</p></section></main>;
}
