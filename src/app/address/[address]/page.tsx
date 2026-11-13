import type { Address } from "viem";
import { getAddress, isAddress } from "viem";
import { formatEth, formatNumber } from "@/lib/format";
import { getRpcClient } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export default async function AddressPage({ params }: { params: Promise<{ address: string }> }) {
  const raw = (await params).address;
  if (!isAddress(raw)) throw new Error("La dirección solicitada no es válida.");
  const address = getAddress(raw) as Address;
  const client = getRpcClient();
  const [balance, code, nonce] = await Promise.all([client.getBalance({ address }), client.getCode({ address }), client.getTransactionCount({ address })]);
  const isContract = Boolean(code && code !== "0x");
  return <div className="shell content"><div className="page-head"><p className="eyebrow">{isContract ? "Contrato" : "Cuenta"}</p><h1>{isContract ? "Contrato inteligente" : "Dirección"}</h1><p className="hash">{address}</p></div><section className="panel"><dl className="detail-list"><div className="detail"><dt>Tipo</dt><dd><span className="badge">{isContract ? "Contrato" : "EOA"}</span></dd></div><div className="detail"><dt>Balance</dt><dd>{formatEth(balance)}</dd></div><div className="detail"><dt>Transacciones enviadas</dt><dd>{formatNumber(nonce)}</dd></div>{isContract && <div className="detail"><dt>Bytecode desplegado</dt><dd><pre className="code-block">{code}</pre></dd></div>}</dl></section></div>;
}
