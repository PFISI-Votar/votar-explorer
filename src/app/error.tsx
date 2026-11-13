"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="shell"><div className="error-card"><h1>No pudimos consultar el nodo</h1><p>La red puede estar reiniciándose o el recurso solicitado no existe. Revisá la conexión y volvé a intentar.</p><button className="button" onClick={reset}>Reintentar</button></div></div>;
}
