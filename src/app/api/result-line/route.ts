import { NextRequest, NextResponse } from 'next/server';
import {
  callAiService,
  extractTextFromAiResponse,
  resolveConfiguredModel,
} from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isWin, gender, affection } = body as {
      isWin: boolean;
      gender: string;
      affection: number;
    };

    const genderLabel = gender === 'girlfriend' ? '女朋友' : '男朋友';

    const messages = [
      {
        role: 'system' as const,
        content: `你扮演一个${isWin ? '已经被哄好的' : '彻底失望的'}${genderLabel}，说一句${isWin ? '甜蜜的话' : '绝情的话'}。只输出一句话，不要加引号，不要加任何额外内容。语气要自然、生活化。`,
      },
      {
        role: 'user' as const,
        content: isWin
          ? `我已经被哄好了，好感度最终是${affection}，说一句甜蜜的话来收尾吧。`
          : `好感度掉到了${affection}，我彻底失望了，说一句绝情的话吧。`,
      },
    ];

    const rawResponse = await callAiService('result-line', {
      model: resolveConfiguredModel('result-line', 'doubao-seed-2-0-lite-260215'),
      temperature: 0.9,
      messages,
    }).catch(error => {
      console.error('Result line API remote error:', error);
      return null;
    });

    return NextResponse.json({
      line: extractTextFromAiResponse(rawResponse).trim().replace(/^["']|["']$/g, ''),
    });
  } catch (error) {
    console.error('Result line API error:', error);
    return NextResponse.json({
      line: '...',
    });
  }
}
