import Link from "next/link";
import { isHash, type Hash, type Transaction } from "viem";
import { formatNumber, formatTimestamp, shortHash } from "@/lib/format";
import { getRpcClient } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export default async function BlockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getRpcClient();
  const block = isHash(id) ? await client.getBlock({ blockHash: id as Hash, includeTransactions: true }) : await client.getBlock({ blockNumber: BigInt(id), includeTransactions: true });
  const transactions = block.transactions as Transaction[];
  return <div className="shell content"><div className="page-head"><p className="eyebrow">Detalle de bloque</p><h1>Bloque #{formatNumber(block.number)}</h1><p>Confirmado el {formatTimestamp(block.timestamp)}.</p></div><section className="panel"><dl className="detail-list"><div className="detail"><dt>Hash</dt><dd className="hash">{block.hash}</dd></div><div className="detail"><dt>Hash anterior</dt><dd><Link className="link hash" href={`/block/${block.parentHash}`}>{block.parentHash}</Link></dd></div><div className="detail"><dt>Transacciones</dt><dd>{transactions.length}</dd></div><div className="detail"><dt>Gas usado / límite</dt><dd>{formatNumber(block.gasUsed)} / {formatNumber(block.gasLimit)}</dd></div><div className="detail"><dt>Miner / validador</dt><dd><Link className="link hash" href={`/address/${block.miner}`}>{block.miner}</Link></dd></div><div className="detail"><dt>Nonce</dt><dd className="hash">{block.nonce}</dd></div></dl></section><section className="panel table-wrap" style={{marginTop:"1.25rem"}}><div className="panel-header"><h2>Transacciones</h2></div>{transactions.length ? <table><thead><tr><th>Hash</th><th>Desde</th><th>Hacia</th><th>Nonce</th></tr></thead><tbody>{transactions.map((tx) => <tr key={tx.hash}><td><Link className="link mono" href={`/tx/${tx.hash}`}>{shortHash(tx.hash)}</Link></td><td><Link className="link mono" href={`/address/${tx.from}`}>{shortHash(tx.from)}</Link></td><td>{tx.to ? <Link className="link mono" href={`/address/${tx.to}`}>{shortHash(tx.to)}</Link> : <span className="badge">Creación</span>}</td><td>{tx.nonce}</td></tr>)}</tbody></table> : <div className="empty">Este bloque no contiene transacciones.</div>}</section></div>;
}
