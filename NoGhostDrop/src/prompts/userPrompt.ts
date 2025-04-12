// 에어드랍 수령자 본인의 지갑정보(services/profileWallet.tx 호출) 랑
// 받고자 하는 토큰의 정보(DB에서 가져오기)
// 잘 합쳐서 ‘이 토큰은 이런 조건을 만족해야하는데, 이 지갑이 만족하는지 분석해줘!’라는 역할의 프롬프트 생성


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
Evaluation Target Wallet: ${profile.address}

Basic Activity Metrics:
- Number of active months: ${profile.active_months}
- Total number of transactions: ${profile.tx_count}
- Number of interacted contracts: ${profile.unique_contracts}
- Bridge usage history: ${profile.bridge_tx_count}
- Average transaction value: ${profile.avg_tx_value.toFixed(4)}
- Transaction value variance: ${profile.var_tx_value.toFixed(4)}
- Function call diversity: ${profile.sig_diversity}
- Transaction time variance: ${profile.tx_time_variance.toFixed(2)}

Transaction Distribution by Hour:
${hourDist || 'No data'}

Function Call Count by Function:
${fnCalls || 'No data'}

Interacted Contracts:
${contractCalls || 'No data'}

Function Call Sequence:
${profile.tx_sequence.length > 0 ? profile.tx_sequence.join(' → ') : 'No sequence'}

Additional Important Conditions (as emphasized by the chain issuer):
${customCriteria || 'None'}

→ For visualization, I need your detailed evaluation. 
Please provide a comprehensive analysis of whether the wallet meets the basic activity metrics and especially the additional important conditions. 
Carefully assess the potential for Sybil risk, providing reasoning for your judgment.
`.trim();
}
