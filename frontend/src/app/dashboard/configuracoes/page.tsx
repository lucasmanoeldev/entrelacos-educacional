'use client';
import { useAuth } from '@/components/auth';
import { PageHeading } from '@/components/ui';
import Link from 'next/link';
export default function Page() { const { user } = useAuth(); return <><PageHeading eyebrow="DO SEU JEITO" title="Minha conta" subtitle="Seus dados de acesso ao Entrelaços."/><section className="editor-panel"><h2>{user?.name}</h2><dl className="account-data"><dt>E-mail</dt><dd>{user?.email}</dd><dt>Perfil</dt><dd>{user?.role === 'STUDENT' ? 'Aluno(a)' : user?.role === 'SCHOOL_ADMIN' ? 'Escola' : 'Professor(a)'}</dd></dl><Link href="/esqueci-senha/" className="button secondary">Redefinir minha senha</Link></section></>; }
