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
📍 평가 대상 지갑: ${profile.address}

🧾 기본 활동 지표:
- 활동한 월 수: ${profile.active_months}
- 총 트랜잭션 수: ${profile.tx_count}
- 상호작용한 컨트랙트 수: ${profile.unique_contracts}
- 브릿지 사용 이력: ${profile.bridge_tx_count}
- 평균 거래 금액: ${profile.avg_tx_value.toFixed(4)}
- 거래 금액 분산: ${profile.var_tx_value.toFixed(4)}
- 함수 호출 다양성: ${profile.sig_diversity}
- 트랜잭션 시간 분산: ${profile.tx_time_variance.toFixed(2)}

🕒 시간대별 트랜잭션 분포:
${hourDist || '데이터 없음'}

🔢 함수별 호출 횟수:
${fnCalls || '데이터 없음'}

📡 상호작용한 컨트랙트:
${contractCalls || '데이터 없음'}

🧬 호출 함수 시퀀스:
${profile.tx_sequence.length > 0 ? profile.tx_sequence.join(' → ') : '시퀀스 없음'}

📌 체인 발행자가 강조한 추가 조건:
${customCriteria || '없음'}

---

📌 추가 지시:
에어드랍 조건(특히 위 조건들)을 기준으로 이 지갑이 적합한지 평가하고, 
결과는 반드시 JSON 형식으로만 응답해줘.

- "eligible": true 또는 false로 결과를 내려줘
- "claimedAmount": 지급할 토큰 수 (숫자, 조건 충족 시에만)
- "summary": 이 판단을 내린 근거를 자연어로 요약

✳️ 너의 응답은 반드시 아래 형식을 따라야 해.  
JSON 형식으로 아래 항목만 포함해줘:

\`\`\`json
{
  "eligible": true | false,
  "claimedAmount": 250,
  "summary": "이 지갑이 조건을 얼마나 잘 만족하는지에 대한 정성적 판단과 설명. 조건을 충족하지 못하면 그 이유도 함께 서술."
}
\`\`\`

조건을 충분히 만족한다면 그 이유를, 부족하다면 어떤 지표가 부족한지를 요약에 담아줘.
응답은 딱 json 형식으로만 깔끔하게 줘.
`.trim();
}
