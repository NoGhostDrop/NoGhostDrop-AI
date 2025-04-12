export type AirdropType = 'FIXED' | 'LEVEL';

export interface AirdropConfig {
  id: string; // UUID (예: 'uuid-1234')
  tokenAddress: string; // 배포할 토큰의 주소
  totalAmount: number; // 전체 에어드랍 총량
  tokenAmountPerWallet: number; // 1명당 지급할 토큰 수 (FIXED일 경우 기준값)
  distributionCriteria: string | null; // LEVEL 방식일 때만 의미 있음
  distributionType: AirdropType; // FIXED or LEVEL
  eligibilityCriteria: string; // 에어드랍 대상 조건 (자유 입력)
  createdAt: string; // ISO8601 형식의 생성 시각 (예: new Date().toISOString())
}
