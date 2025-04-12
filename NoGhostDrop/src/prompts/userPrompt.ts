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
Please provide a comprehensive analysis of whether the wallet meets basic activity indicators and especially additional critical conditions.

To calculate the exact quantitative criteria under additional conditions (for example, "at least five transactions"), calculate the rate of fulfillment:
1. Extract a numerical threshold from each condition (for example, "Trade > 5" means the threshold is 5)
2. Compare to the actual value of the wallet profile
3. Calculate transition rate = (actual value / threshold) * 100%; upper limit 100%

For subjective or qualitative criteria (e.g., "active use," "various transactions":
1. Establish your own rational evaluation criteria based on wallet data
2. Clarify the specific metrics and thresholds selected to evaluate this criterion
3. Can you explain why these indicators are appropriate for this assessment
4. Calculate order processing rates based on defined criteria

Example:
- If the condition is "minimum 5 transactions" and there are 4 transactions in the wallet: 4/5 * 100% = 80% met
- If the condition is "active use" and it is defined as "multiple months of transactions with regular frequency":
* Explain first: "I defined 'active use' as having a deal in another month of at least three months and at least three deals a month."
* Then evaluate: "Wallet is active for two months with an average of four transactions per month, which we rate as a 70% fulfillment."

Each criterion assessment includes:
1. your interpretation of the criteria (especially important for subjective criteria)
2. Specific data points in the wallet profile that you use to evaluate
3. your calculation or reasoning process
4. final rate of fulfillment

Return is in json format,
Example: 
[
  {
    "Criteria": "At least 5 transactions",
    "Score": 80,
    "Reason": "4 out of 5 conditions were met."
  },
  {
    "Criteria": "Active usage",
    "Score": 70
    "Reason": "Active usage is defined as having transactions in at least 3 months with at least 3 transactions per month, but the wallet was active for only 2 months."
  }
]
Don't return anything except this JSON format.

Provides an overall score based on the average of all criteria fulfillment rates and individual scores for each criterion.


We carefully evaluate the potential of Civil Risk by providing a basis for judgment based on trading patterns, timing diversity, and other behavioral indicators.
`.trim();
}