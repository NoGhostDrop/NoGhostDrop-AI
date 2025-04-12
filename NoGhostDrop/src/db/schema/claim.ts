export interface AirdropClaim {
    id: string; // UUID (예: 'uuid-claim-001')
    walletAddress: string; // 수령자 지갑 주소
    tokenAddress: string; // 해당 토큰 주소 (어떤 에어드랍인지 구분용)
    claimedAmount: number; // 실제 지급된 토큰 수
    success: boolean; // 지급 성공 여부
    claimedAt: string; // ISO8601 형식의 시각 (예: new Date().toISOString())
  }
  