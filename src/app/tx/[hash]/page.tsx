import Link from "next/link";
import type { Hash } from "viem";
import { formatEth, formatNumber, formatTimestamp } from "@/lib/format";
import { getRpcClient } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export default async function TransactionPage({ params }: { params: Promise<{ hash: Hash }> }) {
  const { hash } = await params;
  const client = getRpcClient();
  const [tx, receipt] = await Promise.all([client.getTransaction({ hash }), client.getTransactionReceipt({ hash })]);
  const block = await client.getBlock({ blockNumber: tx.blockNumber! });
  const fee = receipt.gasUsed * receipt.effectiveGasPrice;
  return <div className="shell content"><div className="page-head"><p className="eyebrow">Detalle de transacción</p><h1>Transacción</h1><p className="hash">{tx.hash}</p></div><section className="panel"><dl className="detail-list"><div className="detail"><dt>Estado</dt><dd><span className={`badge ${receipt.status === "success" ? "" : "fail"}`}>{receipt.status === "success" ? "Exitosa" : "Fallida"}</span></dd></div><div className="detail"><dt>Bloque</dt><dd><Link className="link" href={`/block/${tx.blockNumber}`}>#{formatNumber(tx.blockNumber!)}</Link> · {formatTimestamp(block.timestamp)}</dd></div><div className="detail"><dt>Desde</dt><dd><Link className="link hash" href={`/address/${tx.from}`}>{tx.from}</Link></dd></div><div className="detail"><dt>Hacia</dt><dd>{tx.to ? <Link className="link hash" href={`/address/${tx.to}`}>{tx.to}</Link> : <>Creación de contrato <Link className="link hash" href={`/address/${receipt.contractAddress}`}>{receipt.contractAddress}</Link></>}</dd></div><div className="detail"><dt>Valor</dt><dd>{formatEth(tx.value)}</dd></div><div className="detail"><dt>Comisión</dt><dd>{formatEth(fee)} ({formatNumber(receipt.gasUsed)} gas)</dd></div><div className="detail"><dt>Nonce</dt><dd>{tx.nonce}</dd></div><div className="detail"><dt>Input</dt><dd><pre className="code-block">{tx.input}</pre></dd></div></dl></section></div>;
}
