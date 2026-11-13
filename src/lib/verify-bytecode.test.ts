import { describe, expect, it } from "vitest";
import { bytecodeMatches } from "./verify-bytecode";

describe("bytecodeMatches", () => {
  it("matches identical bytecode", () => expect(bytecodeMatches({ object: "60016002" }, "0x60016002")).toBe(true));
  it("rejects different bytecode", () => expect(bytecodeMatches({ object: "60016002" }, "0x60026002")).toBe(false));
  it("ignores immutable reference bytes", () => expect(bytecodeMatches({ object: "60000002", immutableReferences: { "0": [{ start: 1, length: 2 }] } }, "0x60abcd02")).toBe(true));
  it("rejects invalid reference bounds", () => expect(bytecodeMatches({ object: "6001", immutableReferences: { "0": [{ start: 2, length: 1 }] } }, "0x6001")).toBe(false));
});
