import Link from "next/link";
import type { Transaction } from "viem";
import { Search } from "@/components/search";
import { formatNumber, relativeTime, shortHash } from "@/lib/format";
import { getNetworkMeta, getRpcClient } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export default async function Home() {
  const client = getRpcClient();
  const latest = await client.getBlockNumber();
  const numbers = Array.from({ length: Math.min(6, Number(latest) + 1) }, (_, index) => latest - BigInt(index));
  const blocks = await Promise.all(numbers.map((blockNumber) => client.getBlock({ blockNumber, includeTransactions: true })));
  const transactions = blocks.flatMap((block) => block.transactions as Transaction[]).slice(0, 6);
  const { chainId, name } = getNetworkMeta();

  return <>
    <section className="hero"><div className="shell"><p className="eyebrow">Explorador de la red electoral</p><h1>La actividad de VOTAR, transparente y verificable.</h1><p className="hero-copy">Consultá bloques, transacciones, cuentas y contratos inteligentes directamente desde el nodo del simulacro.</p><Search /></div></section>
    <div className="shell content">
      <section className="stats" aria-label="Estado de la red">
        <div className="stat"><span className="stat-label">Red</span><span className="stat-value status">{name}</span></div>
        <div className="stat"><span className="stat-label">Último bloque</span><span className="stat-value">#{formatNumber(latest)}</span></div>
        <div className="stat"><span className="stat-label">Chain ID</span><span className="stat-value mono">{chainId}</span></div>
      </section>
      <div className="grid-2">
        <section className="panel"><div className="panel-header"><h2>Últimos bloques</h2><Link href="/blocks">Ver todos</Link></div>
          {blocks.map((block) => <div className="row" key={block.hash}><span className="row-icon">BLK</span><div className="row-main"><Link href={`/block/${block.number}`}>#{formatNumber(block.number)}</Link><div className="row-meta">{block.transactions.length} transacciones</div></div><div className="row-side">{relativeTime(block.timestamp)}</div></div>)}
        </section>
        <section className="panel"><div className="panel-header"><h2>Últimas transacciones</h2><Link href="/transactions">Ver todas</Link></div>
          {transactions.length ? transactions.map((tx) => <div className="row" key={tx.hash}><span className="row-icon">TX</span><div className="row-main"><Link className="mono" href={`/tx/${tx.hash}`}>{shortHash(tx.hash)}</Link><div className="row-meta">De {shortHash(tx.from)} · A {tx.to ? shortHash(tx.to) : "creación de contrato"}</div></div><div className="row-side">bloque #{formatNumber(tx.blockNumber ?? BigInt(0))}</div></div>) : <div className="empty">Todavía no hay transacciones en los últimos bloques.</div>}
        </section>
      </div>
    </div>
  </>;
}
