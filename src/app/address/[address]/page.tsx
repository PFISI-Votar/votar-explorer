import type { Address } from "viem";
import { getAddress, isAddress } from "viem";
import { findVerifiedContract } from "@/lib/db";
import { formatEth, formatNumber } from "@/lib/format";
import { getNetworkMeta, getRpcClient } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export default async function AddressPage({ params }: { params: Promise<{ address: string }> }) {
  const raw = (await params).address;
  if (!isAddress(raw)) throw new Error("La dirección solicitada no es válida.");
  const address = getAddress(raw) as Address;
  const client = getRpcClient();
  const { chainId } = getNetworkMeta();
  const [balance, code, nonce, verified] = await Promise.all([client.getBalance({ address }), client.getCode({ address }), client.getTransactionCount({ address }), findVerifiedContract(chainId, address)]);
  const isContract = Boolean(code && code !== "0x");
  return <div className="shell content"><div className="page-head"><p className="eyebrow">{isContract ? "Contrato" : "Cuenta"}</p><h1>{verified?.name ?? (isContract ? "Contrato inteligente" : "Dirección")}</h1><p className="hash">{address}</p></div><section className="panel"><dl className="detail-list"><div className="detail"><dt>Tipo</dt><dd><span className="badge">{isContract ? "Contrato" : "EOA"}</span>{verified && <> <span className="badge">Código verificado</span></>}</dd></div><div className="detail"><dt>Balance</dt><dd>{formatEth(balance)}</dd></div><div className="detail"><dt>Transacciones enviadas</dt><dd>{formatNumber(nonce)}</dd></div>{verified && <><div className="detail"><dt>Compilador</dt><dd>Solidity {verified.compiler_version}</dd></div><div className="detail"><dt>Ruta del contrato</dt><dd className="hash">{verified.contract_path}</dd></div><div className="detail"><dt>Hash de bytecode</dt><dd className="hash">{verified.bytecode_hash}</dd></div></>}{isContract && <div className="detail"><dt>Bytecode desplegado</dt><dd><pre className="code-block">{code}</pre></dd></div>}</dl></section>{verified && <section className="panel" style={{marginTop:"1.25rem"}}><div className="panel-header"><h2>Código fuente verificado</h2></div>{Object.entries(verified.standard_input.sources).map(([path, source]) => <div className="detail" key={path}><dt className="hash">{path}</dt><dd><pre className="code-block">{source.content}</pre></dd></div>)}</section>}</div>;
}
