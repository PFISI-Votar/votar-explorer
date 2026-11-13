import "server-only";
import { cache } from "react";
import { createPublicClient, defineChain, http } from "viem";

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta configurar ${name}.`);
  return value;
}

const getConfiguration = cache(() => {
  const chainId = Number(process.env.CHAIN_ID ?? "31337");
  if (!Number.isSafeInteger(chainId) || chainId <= 0) throw new Error("CHAIN_ID debe ser un entero positivo.");
  const rpcUrl = required("RPC_URL");
  const headers: Record<string, string> = {};
  if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
    headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
    headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
  }
  return { chainId, rpcUrl, headers };
});

export const getRpcClient = cache(() => {
  const { chainId, rpcUrl, headers } = getConfiguration();
  const chain = defineChain({
    id: chainId,
    name: process.env.NETWORK_NAME ?? "VOTAR Local",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
  });
  return createPublicClient({ chain, batch: { multicall: false }, transport: http(rpcUrl, { fetchOptions: { headers }, retryCount: 2, timeout: 8_000 }) });
});

export function getNetworkMeta() {
  const { chainId } = getConfiguration();
  return { chainId, name: process.env.NETWORK_NAME ?? "VOTAR Local" };
}
