// 에어드랍 등록자가 입력한 토큰 정보 + 수령 조건들을 나중에 꺼내쓰기 쉬운 형태로 잘 정리해서 db에 넣는 로직


// buildAnalysisPrompt.ts

import { z } from 'zod'; //타입 검증 및 유효성 검사 라이브러리

export const AirdropRegistrationSchema = z.object({
  tokenAddress: z.string(), //배포할 토큰의 주소 (string)
  tokenAmount: z.number(), //총 에어드랍할 토큰 수량 (number)
  tokenAmountPerWalletType: z.enum(['Fixed', 'LevelOfContribution']),//고정 지급인지(LevelOfContribution) 선택형인지
  tokenAmountPerWallet: z.number().nullable(), //고정형일 경우, 한 지갑당 지급할 토큰 양 (nullable → 타입이 Fixed일 때만 사용)
  distributionCriteria: z.string().nullable(), //수 기반 차등 지급 기준 (nullable → 타입이 Level일 때만 사용)
  eligibilityCriteria: z.string(),//수령 조건 (텍스트로 자유 입력 받음)
});

export type AirdropRegistrationInput = z.infer<typeof AirdropRegistrationSchema>;

//프롬프트 정리
export function buildAnalysisPrompt(input: AirdropRegistrationInput): string {
  const {
    tokenAddress,
    tokenAmount,
    tokenAmountPerWalletType,
    tokenAmountPerWallet,
    distributionCriteria,
    eligibilityCriteria,
  } = input;

  //토큰 주소, 발행량, 지급방식(고정/차등) 기본정보
  const baseInfo = `
    🔹 Airdrop Token Address: ${tokenAddress}
    🔹 Total Token Supply: ${tokenAmount} tokens
    🔹 Airdrop Method: ${tokenAmountPerWalletType}

    `;  

    //수령조건
  const eligibilityBlock = `
    🧾 Eligibility Criteria:
    ${eligibilityCriteria || 'None provided'} 
    `;

  const distributionBlock =
    tokenAmountPerWalletType === 'Fixed' ? 
    `💰 Fixed Token Per Wallet: ${tokenAmountPerWallet} tokens`
    : `📊 Distribution by Contribution Level:${distributionCriteria || 'No detailed distribution rules provided'}`;

  return `${baseInfo}${eligibilityBlock}${distributionBlock}`.trim();
}
