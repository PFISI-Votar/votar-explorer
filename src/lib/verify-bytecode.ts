type References = Record<string, Record<string, Array<{ start: number; length: number }>>>;

export type DeployedBytecode = {
  object: string;
  linkReferences?: References;
  immutableReferences?: Record<string, Array<{ start: number; length: number }>>;
};

function ranges(bytecode: DeployedBytecode) {
  const result: Array<{ start: number; length: number }> = [];
  for (const file of Object.values(bytecode.linkReferences ?? {})) {
    for (const references of Object.values(file)) result.push(...references);
  }
  for (const references of Object.values(bytecode.immutableReferences ?? {})) result.push(...references);
  return result;
}

export function bytecodeMatches(compiled: DeployedBytecode, deployed: string) {
  const expected = compiled.object.toLowerCase().replace(/^0x/, "");
  const actual = deployed.toLowerCase().replace(/^0x/, "");
  if (!expected || expected.length !== actual.length) return false;
  const ignored = new Uint8Array(expected.length / 2);
  for (const reference of ranges(compiled)) {
    if (reference.start < 0 || reference.length < 0 || reference.start + reference.length > ignored.length) return false;
    ignored.fill(1, reference.start, reference.start + reference.length);
  }
  for (let byte = 0; byte < ignored.length; byte += 1) {
    if (!ignored[byte] && expected.slice(byte * 2, byte * 2 + 2) !== actual.slice(byte * 2, byte * 2 + 2)) return false;
  }
  return true;
}
