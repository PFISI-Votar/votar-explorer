import http from "node:http";
import { pathToFileURL } from "node:url";

const ALLOWED_METHODS = new Set([
  "eth_blockNumber", "eth_call", "eth_chainId", "eth_estimateGas", "eth_feeHistory",
  "eth_gasPrice", "eth_getBalance", "eth_getBlockByHash", "eth_getBlockByNumber",
  "eth_getBlockTransactionCountByHash", "eth_getBlockTransactionCountByNumber",
  "eth_getCode", "eth_getLogs", "eth_getStorageAt", "eth_getTransactionByBlockHashAndIndex",
  "eth_getTransactionByBlockNumberAndIndex", "eth_getTransactionByHash", "eth_getTransactionCount",
  "eth_getTransactionReceipt", "eth_maxPriorityFeePerGas", "eth_sendRawTransaction", "eth_syncing",
  "net_version", "web3_clientVersion",
]);
const MAX_REQUEST_BYTES = 1024 * 1024;
const MAX_BATCH_SIZE = 20;
const UPSTREAM = process.env.HARDHAT_RPC_URL ?? "http://127.0.0.1:8545";

function validCall(call) {
  return call && typeof call === "object" && !Array.isArray(call) && call.jsonrpc === "2.0" && typeof call.method === "string" && ALLOWED_METHODS.has(call.method) && (call.params === undefined || Array.isArray(call.params) || (call.params && typeof call.params === "object"));
}

export function isAllowedPayload(payload) {
  if (Array.isArray(payload)) return payload.length > 0 && payload.length <= MAX_BATCH_SIZE && payload.every(validCall);
  return validCall(payload);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_REQUEST_BYTES) { reject(Object.assign(new Error("too large"), { status: 413 })); request.destroy(); return; }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  response.end(JSON.stringify(body));
}

export function createGateway() {
  return http.createServer(async (request, response) => {
    if (request.method === "GET" && request.url === "/health") return json(response, 200, { status: "ok" });
    if (request.method !== "POST" || request.url !== "/") return json(response, 404, { error: "not_found" });
    if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) return json(response, 415, { error: "content_type_required" });
    try {
      const raw = await readBody(request);
      let payload;
      try { payload = JSON.parse(raw); } catch { return json(response, 400, { error: "invalid_json" }); }
      if (!isAllowedPayload(payload)) return json(response, 403, { error: "rpc_method_not_allowed" });
      const upstream = await fetch(UPSTREAM, { method: "POST", headers: { "content-type": "application/json" }, body: raw, signal: AbortSignal.timeout(10_000) });
      const result = await upstream.text();
      response.writeHead(upstream.ok ? 200 : 502, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
      response.end(result);
    } catch (error) {
      const status = Number(error?.status) || 502;
      if (!response.headersSent) json(response, status, { error: status === 413 ? "request_too_large" : "upstream_unavailable" });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const host = process.env.RPC_GATEWAY_HOST ?? "127.0.0.1";
  const port = Number(process.env.RPC_GATEWAY_PORT ?? "8546");
  createGateway().listen(port, host, () => process.stdout.write(`RPC gateway listening on http://${host}:${port}\n`));
}
