import Link from "next/link";
import { listVerifiedContracts } from "@/lib/db";
import { getNetworkMeta } from "@/lib/rpc";
import { shortHash } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contratos verificados" };

export default async function ContractsPage() {
  const { chainId } = getNetworkMeta();
  const contracts = await listVerifiedContracts(chainId);
  return <div className="shell content"><div className="page-head"><p className="eyebrow">Transparencia</p><h1>Contratos verificados</h1><p>Código recompilado y comparado con el bytecode desplegado en la red.</p></div><section className="panel table-wrap">{contracts.length ? <table><thead><tr><th>Contrato</th><th>Dirección</th><th>Compilador</th><th>Verificado</th></tr></thead><tbody>{contracts.map((contract) => <tr key={contract.address}><td><Link className="link" href={`/address/${contract.address}`}>{contract.name}</Link><div className="row-meta">{contract.contract_path}</div></td><td className="mono">{shortHash(contract.address)}</td><td>Solidity {contract.compiler_version}</td><td>{new Intl.DateTimeFormat("es-AR", { dateStyle:"medium", timeStyle:"short", timeZone:"America/Argentina/Cordoba" }).format(new Date(contract.verified_at))}</td></tr>)}</tbody></table> : <div className="empty">No hay contratos verificados todavía.</div>}</section></div>;
}
