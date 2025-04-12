//에어드랍 자격 진단 (지갑 평가+리포트작성)
import { 
  type IAgentRuntime, 
  type Memory, 
  type State, 
  type Action,
  type HandlerCallback,
  ModelType,
  logger 
} from '@elizaos/core';
import { buildUserPrompt } from '../prompts/userPrompt';
import { SYSTEM_PROMPT } from '../prompts/systemPrompt';
import { CONDITION_LIST } from '../prompts/conditionList';
import type { WalletProfile } from '../types/wallet';

/**
 * 에어드랍 자격 진단 액션
 * 사용자의 지갑 주소를 기반으로 온체인 활동을 분석하고 에어드랍 자격을 평가합니다.
 */
export const receiveReportAction: Action = {
  name: 'WALLET_QUALIFICATION_REPORT',
  similes: ['ANALYZE_WALLET', 'CHECK_AIRDROP_ELIGIBILITY'],
  description: '지갑 주소의 온체인 활동을 분석하고 에어드랍 자격을 평가합니다.',

  validate: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<boolean> => {
    // 메시지에 지갑 주소가 포함되어 있는지 확인
    const walletAddress = message.content.text?.match(/0x[a-fA-F0-9]{40}/);
    return !!walletAddress;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback,
    responses: Memory[]
  ) => {
    try {
      logger.info('Handling WALLET_QUALIFICATION_REPORT action');
      
      // 지갑 주소 추출
      const walletAddressMatch = message.content.text?.match(/0x[a-fA-F0-9]{40}/);
      if (!walletAddressMatch) {
        throw new Error('지갑 주소를 찾을 수 없습니다.');
      }
      
      const walletAddress = walletAddressMatch[0];
      
      // TODO: 실제 서비스 구현 시 지갑 데이터를 가져오는 코드로 대체
      // 지갑 프로필 데이터 가져오기 (예시 데이터)
      const walletProfile: WalletProfile = {
        address: walletAddress,
        active_months: 3,
        tx_count: 15,
        unique_contracts: 4,
        bridge_tx_count: 1,
        avg_tx_value: 0.05,
        var_tx_value: 0.001,
        sig_diversity: 6,
        tx_time_variance: 4.2,
        tx_hour_distribution: {
          '9': 2,
          '12': 3,
          '17': 5, 
          '20': 5
        },
        function_call_counts: {
          'transfer(address,uint256)': { count: 5 },
          'approve(address,uint256)': { count: 3 },
          'swap(uint256,uint256,address[],address)': { count: 4 }
        },
        contract_interactions: {
          '0xdAC17F958D2ee523a2206206994597C13D831ec7': { count: 3 }, // USDT
          '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D': { count: 5 }, // Uniswap Router
          '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45': { count: 2 }  // Uniswap Router V2
        },
        tx_sequence: ['approve', 'swap', 'transfer', 'approve', 'swap']
      };

      // 토큰 발행자의 추가 조건 (예시)
      const customCriteria = '토큰 발행자는 지갑이 최소 1개 이상의 브릿지 활동을 했으며, 다양한 디파이 활동을 3개월 이상 보여주길 기대합니다.';
      
      // 프롬프트 생성
      const userPrompt = buildUserPrompt(walletProfile, customCriteria);
      
      // OpenAI 플러그인을 사용하여 분석 결과 생성 
      let result;
      try {
        // @ts-ignore - 런타임에 실제로 존재하는 메서드이지만 타입 정의가 완전하지 않을 수 있음
        result = await runtime.callAction('openai', 'GENERATE_TEXT', {
          model: 'gpt-4',
          prompt: userPrompt,
          system: SYSTEM_PROMPT,
          max_tokens: 2000,
          temperature: 0.5,
        });
      } catch (error) {
        logger.error('OpenAI 호출 중 오류 발생:', error);
        // 플러그인 직접 접근이 불가능한 경우 대체 방법 시도
        try {
          result = "지갑 분석 결과를 생성할 수 없습니다. OpenAI API 키가 설정되어 있는지 확인하세요.";
          logger.warn('OpenAI API를 사용할 수 없어 기본 메시지로 대체합니다.');
        } catch (innerError) {
          logger.error('대체 메시지 생성 중 오류 발생:', innerError);
          throw new Error('지갑 분석을 위한 AI 서비스를 사용할 수 없습니다.');
        }
      }
      
      // 분석 결과와 조건 리스트 포함하여 응답
      const responseText = `
## 에어드랍 자격 진단 결과

${result}

## 평가 조건 목록

${CONDITION_LIST.map(cond => `**${cond.id} ${cond.title}**: ${cond.description}`).join('\n\n')}
      `.trim();

      // 결과 콜백 호출
      await callback({
        text: responseText,
        actions: ['WALLET_QUALIFICATION_REPORT'],
        source: message.content.source,
        data: {
          walletAddress,
          reportTimestamp: new Date().toISOString(),
          conditions: CONDITION_LIST
        }
      });

      return { text: responseText };
    } catch (error) {
      logger.error('Error in WALLET_QUALIFICATION_REPORT action:', error);
      throw error;
    }
  },

  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: '지갑 주소 0x742d35Cc6634C0532925a3b844Bc454e4438f44e에 대한 에어드랍 자격을 평가해줘',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: '## 에어드랍 자격 진단 결과\n\n...상세 분석 결과...',
          actions: ['WALLET_QUALIFICATION_REPORT'],
        },
      },
    ],
  ],
};