CREATE TABLE IF NOT EXISTS verified_contracts (
  chain_id BIGINT NOT NULL,
  address VARCHAR(42) NOT NULL,
  name TEXT NOT NULL,
  contract_path TEXT NOT NULL,
  compiler_version TEXT NOT NULL,
  bytecode_hash VARCHAR(66) NOT NULL,
  abi JSONB NOT NULL,
  standard_input JSONB NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (chain_id, address)
);

CREATE INDEX IF NOT EXISTS verified_contracts_verified_at_idx
  ON verified_contracts (verified_at DESC);
