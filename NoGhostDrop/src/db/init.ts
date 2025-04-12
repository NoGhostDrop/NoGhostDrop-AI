// src/db/init.ts
import { sql } from '@elizaos/plugin-sql';

export async function initDB() {
  const createAirDropTableQuery = `
    CREATE TABLE IF NOT EXISTS airdrops (
      id TEXT PRIMARY KEY,
      tokenAddress TEXT NOT NULL,
      totalAmount INTEGER NOT NULL,
      tokenAmountPerWallet INTEGER NOT NULL,
      distributionType TEXT NOT NULL,
      eligibilityCriteria TEXT NOT NULL,
      distributionCriteria TEXT,
      createdAt TEXT NOT NULL
    );
  `;

  const createClaimTableQuery = `
    CREATE TABLE IF NOT EXISTS airdrop_claims (
      id TEXT PRIMARY KEY,
      walletAddress TEXT NOT NULL,
      tokenAddress TEXT NOT NULL,
      claimedAmount INTEGER NOT NULL,
      success BOOLEAN NOT NULL,
      claimedAt TEXT NOT NULL
    );
  `;

  await sql.execute(createAirDropTableQuery);
  await sql.execute(createClaimTableQuery);

}
