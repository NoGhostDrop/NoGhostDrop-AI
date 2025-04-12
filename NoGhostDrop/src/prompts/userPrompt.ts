// 에어드랍 수령자 본인의 지갑정보(services/profileWallet.tx 호출) 랑
// 받고자 하는 토큰의 정보(DB에서 가져오기)
// 잘 합쳐서 ‘이 토큰은 이런 조건을 만족해야하는데, 이 지갑이 만족하는지 분석해줘!’라는 역할의 프롬프트 생성

//아래는 예시
import type { WalletProfile } from '../types/wallet';

export function buildUserPrompt(profile: WalletProfile, customCriteria: string): string {
  const fnCalls = Object.entries(profile.function_call_counts)
    .map(([fn, info]) => `- ${fn}: ${info.count}회`)
    .join('\n');

  const contractCalls = Object.entries(profile.contract_interactions)
    .map(([contract, info]) => `- ${contract}: ${info.count}회`)
    .join('\n');

  const hourDist = Object.entries(profile.tx_hour_distribution)
    .map(([hour, count]) => `- ${hour}시: ${count}건`)
    .join('\n');

  return `
🧾 평가 대상 지갑: ${profile.address}

📍 기본 활동 지표:
- 활동한 월 수: ${profile.active_months}
- 총 트랜잭션 수: ${profile.tx_count}
- 상호작용한 컨트랙트 수: ${profile.unique_contracts}
- 브릿지 사용 이력: ${profile.bridge_tx_count}
- 평균 거래 금액: ${profile.avg_tx_value.toFixed(4)}
- 거래 금액 분산: ${profile.var_tx_value.toFixed(4)}
- 함수 호출 다양성: ${profile.sig_diversity}
- 트랜잭션 시간 분산: ${profile.tx_time_variance.toFixed(2)}

📊 시간대별 트랜잭션 분포:
${hourDist || '데이터 없음'}

🔢 함수별 호출 횟수:
${fnCalls || '데이터 없음'}

📡 상호작용한 컨트랙트:
${contractCalls || '데이터 없음'}

🧬 호출 함수 시퀀스:
${profile.tx_sequence.length > 0 ? profile.tx_sequence.join(' → ') : '시퀀스 없음'}

📌 추가 중요 조건 (체인 발행자 측에서 강조한 항목):
${customCriteria || '없음'}

→ 위 내용을 종합하여, 001~008 조건 기준으로 평가하고, 시빌 가능성 여부를 분석해줘.
`.trim();
}
