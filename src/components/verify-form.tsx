"use client";

import { FormEvent, useState } from "react";

type Result = { address?: string; name?: string; error?: string; details?: string[] };

export function VerifyForm() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    const form = new FormData(event.currentTarget);
    const file = form.get("buildInfo") as File;
    try {
      if (!file || file.size > 4 * 1024 * 1024) throw new Error("Seleccioná un build-info de hasta 4 MiB.");
      const buildInfo = JSON.parse(await file.text());
      const response = await fetch("/api/verify", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${form.get("token")}` }, body: JSON.stringify({ address: form.get("address"), buildInfo }) });
      const data = await response.json() as Result;
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "No se pudo verificar el contrato." });
    } finally { setBusy(false); }
  }

  return <form className="form" onSubmit={submit}>
    <p className="notice">La verificación recompila el build-info y compara el bytecode con el nodo. El token se envía una sola vez y no se guarda en el navegador.</p>
    <div className="field"><label htmlFor="address">Dirección del contrato</label><input id="address" name="address" pattern="0x[a-fA-F0-9]{40}" placeholder="0x…" required /></div>
    <div className="field"><label htmlFor="buildInfo">Build-info de Hardhat</label><input id="buildInfo" name="buildInfo" type="file" accept="application/json,.json" required /><small>Usá el JSON correspondiente de artifacts/build-info. Compilador admitido: 0.8.26.</small></div>
    <div className="field"><label htmlFor="token">Token de verificación</label><input id="token" name="token" type="password" autoComplete="off" required /></div>
    <button className="button" disabled={busy}>{busy ? "Verificando…" : "Verificar código"}</button>
    {result?.error && <div className="error-card" style={{margin:"1rem 0 0"}}><strong>{result.error}</strong>{result.details?.map((line) => <pre key={line} className="code-block">{line}</pre>)}</div>}
    {result?.address && <p className="notice" style={{background:"var(--mint)",color:"var(--brand-dark)",marginTop:"1rem"}}>Contrato {result.name} verificado correctamente. <a className="link" href={`/address/${result.address}`}>Ver contrato</a></p>}
  </form>;
}
