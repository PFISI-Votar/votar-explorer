import Link from "next/link";
import { formatNumber, formatTimestamp, shortHash } from "@/lib/format";
import { getRpcClient } from "@/lib/rpc";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bloques" };

export default async function BlocksPage() {
  const client = getRpcClient();
  const latest = await client.getBlockNumber();
  const numbers = Array.from({ length: Math.min(25, Number(latest) + 1) }, (_, i) => latest - BigInt(i));
  const blocks = await Promise.all(numbers.map((blockNumber) => client.getBlock({ blockNumber })));
  return <div className="shell content"><div className="page-head"><p className="eyebrow">Cadena</p><h1>Bloques</h1><p>Los 25 bloques más recientes confirmados por el nodo.</p></div><section className="panel table-wrap"><table><thead><tr><th>Bloque</th><th>Fecha</th><th>Transacciones</th><th>Hash</th><th>Gas usado</th></tr></thead><tbody>{blocks.map((block) => <tr key={block.hash}><td><Link className="link" href={`/block/${block.number}`}>#{formatNumber(block.number)}</Link></td><td>{formatTimestamp(block.timestamp)}</td><td>{block.transactions.length}</td><td className="mono">{shortHash(block.hash)}</td><td>{formatNumber(block.gasUsed)}</td></tr>)}</tbody></table></section></div>;
}
