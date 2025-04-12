// src/services/registerAirdrop.ts
import { AirdropRegistrationInput } from '../prompts/buildAnalysisPrompt';
import { AirdropConfig } from '../db/schema/airdrop';
import { saveAirdropConfig } from '../db/saveAirdropConfig';
import { randomUUID } from 'crypto';

export async function registerAirdrop(input: AirdropRegistrationInput) {
  const config: AirdropConfig = {
    id: randomUUID(),
    tokenAddress: input.tokenAddress,
    totalAmount: input.tokenAmount,
    tokenAmountPerWallet: input.tokenAmountPerWallet ?? 0,
    distributionCriteria: input.distributionCriteria ?? null,
    distributionType: input.tokenAmountPerWalletType === 'Fixed' ? 'FIXED' : 'LEVEL',
    eligibilityCriteria: input.eligibilityCriteria,
    createdAt: new Date().toISOString(),
  };

  await saveAirdropConfig(config);
}
