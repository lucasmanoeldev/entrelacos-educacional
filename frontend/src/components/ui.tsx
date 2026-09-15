'use client';
import { LoaderCircle, X, ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, useEffect, useRef } from 'react';
export function Brand() { return <Link href="/" className="brand"><span className="brand-icon"><BookOpen size={23}/></span>entrelaços<span className="brand-dot">.</span></Link>; }
export function Loading() { return <div className="empty" role="status"><LoaderCircle className="spin"/> Carregando…</div>; }
export function ErrorMessage({ message }: { message: string }) { return message ? <div className="alert" role="alert">{message}</div> : null; }
export function Empty({ title, children }: { title: string; children?: ReactNode }) { return <div className="empty"><BookOpen size={32}/><h3>{title}</h3>{children}</div>; }
export function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} onCancel={close} onClick={e => { if (e.target === ref.current) close(); }}><div className="modal-heading"><h2>{title}</h2><button className="icon-button" aria-label="Fechar" onClick={close}><X/></button></div>{children}</dialog>;
}
export function PageHeading({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: string; subtitle?: string; children?: ReactNode }) { return <div className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{subtitle && <p className="muted">{subtitle}</p>}</div>{children}</div>; }
export function PublicHeader() { return <header className="public-header"><Brand/><nav><Link href="/explorar/">Explorar atividades</Link><Link href="/#formatos">Formatos</Link><Link href="/jogar/">Entrar com código <ArrowUpRight size={15}/></Link></nav><div className="header-actions"><Link href="/login/" className="login-link">Entrar</Link><Link className="button small" href="/cadastro/">Criar conta <Sparkles size={15}/></Link></div></header>; }
