import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedOrigin, isAllowedPayload } from "./rpc-gateway.mjs";

test("allows read-only Ethereum calls", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", true] }), true));
test("blocks signed raw transactions in read-only mode", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "eth_sendRawTransaction", params: ["0x00"] }), false));
test("allows signed raw transactions only in write mode", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "eth_sendRawTransaction", params: ["0x00"] }, "write"), true));
test("blocks Hardhat administration", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "hardhat_reset", params: [] }), false));
test("blocks unlocked-account signing", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "eth_sendTransaction", params: [] }), false));
test("blocks oversized batches", () => assert.equal(isAllowedPayload(Array.from({ length: 21 }, (_, id) => ({ jsonrpc: "2.0", id, method: "eth_blockNumber", params: [] }))), false));
test("allows server-to-server requests without Origin", () => assert.equal(isAllowedOrigin(undefined, new Set()), true));
test("allows configured browser origin", () => assert.equal(isAllowedOrigin("https://votar-front.vercel.app", new Set(["https://votar-front.vercel.app"])), true));
test("blocks unconfigured browser origin", () => assert.equal(isAllowedOrigin("https://attacker.example", new Set(["https://votar-front.vercel.app"])), false));
