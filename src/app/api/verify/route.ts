import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import solc from "solc";
import { getAddress, isAddress, keccak256, type Address, type Hex } from "viem";
import { getDb, type StandardJsonInput } from "@/lib/db";
import { getNetworkMeta, getRpcClient } from "@/lib/rpc";
import { bytecodeMatches, type DeployedBytecode } from "@/lib/verify-bytecode";

export const runtime = "nodejs";
export const maxDuration = 30;
const MAX_BODY_BYTES = 4 * 1024 * 1024;

type BuildInfo = { solcVersion?: string; input?: StandardJsonInput };
type CompilerContract = { abi?: unknown; evm?: { deployedBytecode?: DeployedBytecode } };
type CompilerOutput = { errors?: Array<{ severity: string; formattedMessage?: string; message?: string }>; contracts?: Record<string, Record<string, CompilerContract>> };

function authenticated(request: Request) {
  const expected = process.env.VERIFY_API_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

function validateInput(input: StandardJsonInput) {
  if (input?.language !== "Solidity" || !input.sources || typeof input.settings !== "object") throw new Error("El build-info no contiene un Standard JSON Input de Solidity válido.");
  const sources = Object.entries(input.sources);
  if (!sources.length || sources.length > 100) throw new Error("El build-info debe contener entre 1 y 100 fuentes.");
  const total = sources.reduce((size, [name, source]) => {
    if (!name || name.includes("\0") || typeof source?.content !== "string") throw new Error("Hay una fuente inválida en el build-info.");
    return size + Buffer.byteLength(source.content, "utf8");
  }, 0);
  if (total > 2 * 1024 * 1024) throw new Error("Las fuentes superan el límite de 2 MiB.");
}

export async function POST(request: Request) {
  if (!authenticated(request)) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });

  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
    const body = JSON.parse(raw) as { address?: string; buildInfo?: BuildInfo };
    if (!body.address || !isAddress(body.address)) return NextResponse.json({ error: "Dirección inválida." }, { status: 400 });
    if (!body.buildInfo?.input) return NextResponse.json({ error: "Falta el build-info de Hardhat." }, { status: 400 });
    if (body.buildInfo.solcVersion !== "0.8.26") return NextResponse.json({ error: "Solo se admite el compilador Solidity 0.8.26 fijado por el proyecto." }, { status: 400 });
    validateInput(body.buildInfo.input);

    const db = getDb();
    if (!db) return NextResponse.json({ error: "La base de datos no está configurada." }, { status: 503 });
    const address = getAddress(body.address) as Address;
    const deployed = await getRpcClient().getCode({ address });
    if (!deployed || deployed === "0x") return NextResponse.json({ error: "La dirección no contiene un contrato desplegado." }, { status: 400 });

    const input = structuredClone(body.buildInfo.input);
    input.settings.outputSelection = { "*": { "*": ["abi", "evm.deployedBytecode"] } };
    const output = JSON.parse(solc.compile(JSON.stringify(input))) as CompilerOutput;
    const errors = (output.errors ?? []).filter((item) => item.severity === "error");
    if (errors.length) return NextResponse.json({ error: "La recompilación falló.", details: errors.slice(0, 5).map((item) => item.formattedMessage ?? item.message) }, { status: 422 });

    const matches: Array<{ path: string; name: string; contract: CompilerContract }> = [];
    for (const [path, contracts] of Object.entries(output.contracts ?? {})) {
      for (const [name, contract] of Object.entries(contracts)) {
        const bytecode = contract.evm?.deployedBytecode;
        if (bytecode && bytecodeMatches(bytecode, deployed)) matches.push({ path, name, contract });
      }
    }
    if (matches.length !== 1) return NextResponse.json({ error: matches.length ? "Más de un contrato coincide; reducí el build-info." : "El bytecode recompilado no coincide con el desplegado." }, { status: 422 });

    const match = matches[0];
    const { chainId } = getNetworkMeta();
    const bytecodeHash = keccak256(deployed as Hex);
    await db`INSERT INTO verified_contracts (chain_id, address, name, contract_path, compiler_version, bytecode_hash, abi, standard_input)
      VALUES (${chainId}, ${address.toLowerCase()}, ${match.name}, ${match.path}, ${"0.8.26"}, ${bytecodeHash}, ${db.json((match.contract.abi ?? []) as never)}, ${db.json(input as never)})
      ON CONFLICT (chain_id, address) DO UPDATE SET name = EXCLUDED.name, contract_path = EXCLUDED.contract_path, compiler_version = EXCLUDED.compiler_version, bytecode_hash = EXCLUDED.bytecode_hash, abi = EXCLUDED.abi, standard_input = EXCLUDED.standard_input, verified_at = NOW()`;
    return NextResponse.json({ address, name: match.name, contractPath: match.path, bytecodeHash });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo procesar la verificación.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
