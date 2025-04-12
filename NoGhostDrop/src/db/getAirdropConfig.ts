// src/db/getAirdropConfigByToken.ts

import { sql } from '@elizaos/plugin-sql';
import { AirdropConfig } from './schema/airdrop';

export async function getAirdropConfigByToken(tokenAddress: string): Promise<AirdropConfig | null> {
  const rows = await sql.query(
    `
    SELECT *
    FROM airdrops
    WHERE tokenAddress = ?
    ORDER BY createdAt DESC
    LIMIT 1
  `,
    [tokenAddress]
  );

  if (rows.length === 0) return null;

  const row = rows[0];

  return {
    id: row.id,
    tokenAddress: row.tokenAddress,
    totalAmount: row.totalAmount,
    tokenAmountPerWallet: row.tokenAmountPerWallet,
    distributionType: row.distributionType,
    eligibilityCriteria: row.eligibilityCriteria,
    distributionCriteria: row.distributionCriteria,
    createdAt: row.createdAt,
  };
}
