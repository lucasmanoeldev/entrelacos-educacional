import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Entrelaços · Aprender é uma descoberta', template: '%s · Entrelaços' }, description: 'Crie atividades, transforme conteúdos em jogos e acompanhe cada descoberta dos seus alunos.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><body><AuthProvider>{children}</AuthProvider></body></html>; }
