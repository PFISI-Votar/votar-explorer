import Link from "next/link";
import type { Transaction } from "viem";
import { formatEth, formatNumber, shortHash } from "@/lib/format";
import { getRpcClient } from "@/lib/rpc";

export const dynamic = "force-dynamic";
export const metadata = { title: "Transacciones" };

export default async function TransactionsPage() {
  const client = getRpcClient();
  const latest = await client.getBlockNumber();
  const numbers = Array.from({ length: Math.min(20, Number(latest) + 1) }, (_, i) => latest - BigInt(i));
  const blocks = await Promise.all(numbers.map((blockNumber) => client.getBlock({ blockNumber, includeTransactions: true })));
  const transactions = blocks.flatMap((block) => block.transactions as Transaction[]).slice(0, 100);
  return <div className="shell content"><div className="page-head"><p className="eyebrow">Actividad</p><h1>Transacciones</h1><p>Hasta 100 transacciones de los 20 bloques más recientes.</p></div><section className="panel table-wrap">{transactions.length ? <table><thead><tr><th>Hash</th><th>Bloque</th><th>Desde</th><th>Hacia</th><th>Valor</th></tr></thead><tbody>{transactions.map((tx) => <tr key={tx.hash}><td><Link className="link mono" href={`/tx/${tx.hash}`}>{shortHash(tx.hash)}</Link></td><td><Link className="link" href={`/block/${tx.blockNumber}`}>#{formatNumber(tx.blockNumber ?? BigInt(0))}</Link></td><td><Link className="link mono" href={`/address/${tx.from}`}>{shortHash(tx.from)}</Link></td><td>{tx.to ? <Link className="link mono" href={`/address/${tx.to}`}>{shortHash(tx.to)}</Link> : <span className="badge">Creación</span>}</td><td>{formatEth(tx.value)}</td></tr>)}</tbody></table> : <div className="empty">No hay transacciones recientes.</div>}</section></div>;
}
