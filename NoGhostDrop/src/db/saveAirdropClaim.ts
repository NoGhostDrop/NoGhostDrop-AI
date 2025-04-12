import { sql } from '@elizaos/plugin-sql';
import { randomUUID } from 'crypto';

export type SaveClaimInput = {
  walletAddress: string;
  tokenAddress: string;
  claimedAmount: number;
  success: boolean;
};

export async function saveAirdropClaim(input: SaveClaimInput): Promise<void> {
  const now = new Date().toISOString();

  await sql.execute(
    `INSERT INTO airdrop_claims (
      id,
      walletAddress,
      tokenAddress,
      claimedAmount,
      success,
      claimedAt
    ) VALUES ( ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      input.walletAddress,
      input.tokenAddress,
      input.claimedAmount,
      input.success,
      now,
    ]
  );
}
