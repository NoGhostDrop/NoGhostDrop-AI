//에어드랍 수령 (지갑 평가 + 리포트 + 조건 충족시 컨트랙트 호출)
import { getAirdropConfigByToken } from '../db/getAirdropConfig';
import { profileWallet } from '../services/walletProfile';
import { analyzeWithLLM } from '../services/analyzeWithLLM';
import {saveAirdropClaim} from "../db/saveAirdropClaim"

type LLMResult = {
    eligible: boolean;
    claimedAmount?: number;
    summary: string;
  };

export async function runWalletClaim(walletAddress: string, tokenAddress: string) {
  const airdropConfig = await getAirdropConfigByToken(tokenAddress);
  if (!airdropConfig) {
    throw new Error('no such airdrop of token');
  }

  const profile = await profileWallet(walletAddress);
  const result = await analyzeWithLLM(profile, airdropConfig.eligibilityCriteria); // criteriaText는 DB에서 가져온 조건 설명

  let parsed: LLMResult;
  try {
    parsed = JSON.parse(result);
  } catch {
    throw new Error('LLM 응답 파싱 실패: ' + result);
  }

  const claimedAmount =
    airdropConfig.distributionType === 'FIXED'
      ? airdropConfig.tokenAmountPerWallet
      : parsed.claimedAmount || 0;
  
  //db 저장
  await saveAirdropClaim({
    walletAddress,
    tokenAddress,
    claimedAmount,
    success: parsed.eligible,
  });

  console.log('🔍 분석 결과:', result);
  return result;
}