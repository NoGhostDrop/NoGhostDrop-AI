// src/db/init.ts
import { sql } from '@elizaos/plugin-sql';

export async function initDB() {
  const createTableQuery = `
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
  await sql.execute(createTableQuery);
}
