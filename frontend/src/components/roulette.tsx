'use client';
import { useEffect, useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { GameQuestion } from '@/lib/types';
import { ErrorMessage } from './ui';

const colors = ['#315d4b', '#f5df95', '#a7bea0', '#d6c7e8', '#edbd85'];
export function Roulette({ slots, spin, onReveal }: { slots: number[]; spin: () => Promise<GameQuestion>; onReveal: (question: GameQuestion) => void }) {
  const [busy, setBusy] = useState(false); const [rotation, setRotation] = useState(0); const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null); const locked = useRef(false); const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; if (timer.current) clearTimeout(timer.current); }; }, []);
  const segment = 360 / slots.length;
  const background = `conic-gradient(${slots.map((_, i) => `${colors[i % colors.length]} ${i * segment}deg ${(i + 1) * segment}deg`).join(',')})`;
  async function turn() {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    try {
      const selected = await spin();
      if (!mounted.current) return;
      const index = slots.indexOf(selected.wheel_number!);
      setRotation(1800 + 360 - (index + .5) * segment);
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2200;
      timer.current = setTimeout(() => { if (mounted.current) onReveal(selected); }, duration);
    } catch (e) { if (mounted.current) { setError((e as Error).message); setBusy(false); locked.current = false; } }
  }
  return <section className="roulette-stage"><h1>Qual será a próxima descoberta?</h1><p className="muted">Gire para sortear uma pergunta. Cada pergunta aparece uma única vez.</p><div className="roulette-frame" aria-hidden="true"><span className="roulette-pointer"/><div className="roulette-wheel" style={{ background, transform: `rotate(${rotation}deg)` }}>{slots.map((n, i) => <span className="roulette-label" key={n} style={{ transform: `rotate(${(i + .5) * segment}deg)`, fontSize: slots.length > 20 ? 9 : 14 }}><b style={{ color: i % colors.length === 0 ? '#fff' : '#243b31' }}>{n}</b></span>)}</div><span className="roulette-hub">✦</span></div><p className="small-text" role="status">{busy ? 'Sorteando sua próxima pergunta…' : `${slots.length} ${slots.length === 1 ? 'pergunta disponível' : 'perguntas disponíveis'}`}</p><ErrorMessage message={error}/><button className="button" disabled={busy} onClick={turn}><RotateCw size={18}/>{busy ? 'Girando…' : 'Girar roleta'}</button></section>;
}
