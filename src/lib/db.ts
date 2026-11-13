import "server-only";
import postgres, { type Sql } from "postgres";

export type VerifiedContract = {
  chain_id: string;
  address: string;
  name: string;
  contract_path: string;
  compiler_version: string;
  bytecode_hash: string;
  abi: unknown;
  standard_input: StandardJsonInput;
  verified_at: Date;
};

export type StandardJsonInput = {
  language: "Solidity";
  sources: Record<string, { content: string }>;
  settings: Record<string, unknown>;
};

let sql: Sql | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  sql ??= postgres(url, { max: 3, idle_timeout: 20, connect_timeout: 8, prepare: false });
  return sql;
}

export async function findVerifiedContract(chainId: number, address: string) {
  const db = getDb();
  if (!db) return null;
  const rows = await db<VerifiedContract[]>`SELECT * FROM verified_contracts WHERE chain_id = ${chainId} AND address = ${address.toLowerCase()} LIMIT 1`;
  return rows[0] ?? null;
}

export async function listVerifiedContracts(chainId: number) {
  const db = getDb();
  if (!db) return [];
  return db<VerifiedContract[]>`SELECT * FROM verified_contracts WHERE chain_id = ${chainId} ORDER BY verified_at DESC LIMIT 200`;
}
