'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="empty"><h1>Algo interrompeu esta descoberta.</h1><p>Tente carregar a página novamente.</p><button className="button" onClick={reset}>Tentar novamente</button></main>; }
