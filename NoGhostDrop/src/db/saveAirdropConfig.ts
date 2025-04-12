// db/init.ts 또는 최초 실행시 한번만 실행


import { sql } from '@elizaos/plugin-sql';
import { AirdropConfig } from './schema/airdrop.ts';

/**
 * 에어드랍 설정 정보를 DB에 저장하는 함수
 * @param config - AirdropConfig 형태의 에어드랍 설정
 */
export async function saveAirdropConfig(config: AirdropConfig): Promise<void> {
  await sql.execute(
    `
    INSERT INTO airdrops (
      id,
      tokenAddress,
      totalAmount,
      tokenAmountPerWallet,
      distributionType,
      eligibilityCriteria,
      distributionCriteria,
      createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      config.id,
      config.tokenAddress,
      config.totalAmount,
      config.tokenAmountPerWallet,
      config.distributionType,
      config.eligibilityCriteria,
      config.distributionCriteria,
      config.createdAt,
    ]
  );
}
