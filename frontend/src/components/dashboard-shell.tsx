'use client';
import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Library, Plus, Compass, Heart, BarChart3, Sparkles, Settings, LogOut, Menu, ArrowUpRight, X } from 'lucide-react';
import { useAuth } from './auth';
import { Brand, Loading, ErrorMessage } from './ui';
const links = [
  ['/dashboard/', 'Visão geral', LayoutDashboard], ['/dashboard/atividades/', 'Minhas atividades', Library],
  ['/explorar/', 'Explorar biblioteca', Compass], ['/dashboard/favoritos/', 'Favoritos', Heart],
  ['/dashboard/resultados/', 'Resultados', BarChart3], ['/dashboard/ia/', 'Criar com IA', Sparkles],
  ['/dashboard/configuracoes/', 'Minha conta', Settings],
] as const;
export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth(); const path = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (!loading && !user) router.replace('/login/'); }, [loading, user, router]);
  if (loading || !user) return <Loading/>;
  return <div className="dashboard"><aside className={`sidebar ${open ? 'open' : ''}`}><div className="sidebar-brand"><Brand/><button className="icon-button mobile-only" aria-label="Fechar menu" onClick={() => setOpen(false)}><X/></button></div>{user.role !== 'STUDENT' && <Link href="/dashboard/atividades/criar/" className="button full" onClick={() => setOpen(false)}><Plus size={18}/> Criar atividade</Link>}<span className="nav-label">SEU ESPAÇO</span><nav>{links.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} className={path === href || (href !== '/dashboard/' && path.startsWith(href)) ? 'active' : ''}><Icon size={18}/>{label}{href.includes('/ia/') && <span className="new-badge">IA</span>}</Link>)}</nav><div className="sidebar-bottom"><div className="sidebar-note"><span>✳</span><b>Uma ideia pode<br/>mudar uma aula.</b><p>Que tal experimentar um novo formato hoje?</p></div><button className="logout" onClick={async () => { try { await logout(); router.push('/'); } catch (e) { setError((e as Error).message); } }}><LogOut size={17}/> Sair da conta</button></div></aside><div className="dashboard-body"><header className="dashboard-header"><div><button className="icon-button mobile-only" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu/></button><span>Seu espaço de descobertas</span></div><div><Link href="/jogar/">Entrar com código <ArrowUpRight size={15}/></Link><span className="avatar">{user.name.charAt(0).toUpperCase()}</span><span className="user-label">{user.name}<small>{user.role === 'STUDENT' ? 'Aluno(a)' : 'Educador(a)'}</small></span></div></header><main className="dashboard-main"><ErrorMessage message={error}/>{children}</main></div></div>;
}
