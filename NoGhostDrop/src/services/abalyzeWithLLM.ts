// LLM에 요청할때  system, user 프롬프트 합쳐서 분석 요청하는 부분. 
// (그럼 얘는 systemPrompt, userPrompt 임포트해서 쓰겠지?!)


//아래는 예시
import { SYSTEM_PROMPT } from '../prompts/systemPrompt';
import { buildUserPrompt } from '../prompts/userPrompt';
import { WalletProfile } from '../types/wallet';

//choices[0].message.content여기에 분석결과 들어올 것!
type OpenAIResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
};

export async function analyzeWithLLM(profile: WalletProfile, customCriteria: string): Promise<string> {
  const userPrompt = buildUserPrompt(profile, customCriteria);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  // ✅ 타입 단언 추가!
  const data = await response.json() as OpenAIResponse;

  return data.choices?.[0]?.message?.content || '분석 결과를 가져오지 못했습니다.';
}


