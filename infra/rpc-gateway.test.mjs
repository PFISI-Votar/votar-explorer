import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedPayload } from "./rpc-gateway.mjs";

test("allows read-only Ethereum calls", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "eth_getBlockByNumber", params: ["latest", true] }), true));
test("allows signed raw transactions", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "eth_sendRawTransaction", params: ["0x00"] }), true));
test("blocks Hardhat administration", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "hardhat_reset", params: [] }), false));
test("blocks unlocked-account signing", () => assert.equal(isAllowedPayload({ jsonrpc: "2.0", id: 1, method: "eth_sendTransaction", params: [] }), false));
test("blocks oversized batches", () => assert.equal(isAllowedPayload(Array.from({ length: 21 }, (_, id) => ({ jsonrpc: "2.0", id, method: "eth_blockNumber", params: [] }))), false));
