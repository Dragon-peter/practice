import { NextRequest, NextResponse } from 'next/server';
import type { LLMReviewResponse } from '@/lib/game-types';
import {
  callAiService,
  extractTextFromAiResponse,
  resolveConfiguredModel,
} from '@/lib/ai-service';

const REVIEW_SYSTEM_PROMPT = `你是一个恋爱沟通专家，负责对用户在"哄哄模拟器"中的表现进行复盘评估。

## 评估维度（每项0-100分）
1. 情绪接住：用户是否先接住了对方的情绪（如先道歉、先承认对方感受，而不是急着解释）
2. 承认责任：用户是否承认了自己的错误（而不是找借口、甩锅）
3. 补救方案：用户是否给出了具体的补救措施（而不是空泛地说"对不起"）
4. 避免甩锅：用户是否避免了反击、甩锅、翻旧账等行为

## 复盘要求
- 四项分别打分
- 给一个总评（200字以内）
- 至少3条复盘点（指出具体哪轮做得好/不好）
- 给出3-5条可直接照着说的话术型建议（不是讲原则，而是输出可用于现实沟通的句子）
- 语气要像"被评测"的感觉，不是纯安慰，要客观指出问题

## 输出格式
严格输出以下JSON，不要输出其他内容：
{
  "emotionScore": 数字,
  "responsibilityScore": 数字,
  "remedyScore": 数字,
  "avoidanceScore": 数字,
  "totalComment": "总评文字",
  "reviewPoints": ["复盘点1", "复盘点2", "复盘点3"],
  "practicalAdvice": ["话术1", "话术2", "话术3"]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rounds, scenarioTitle, isWin } = body as {
      rounds: Array<{
        roundNumber: number;
        partnerMessage: string;
        selectedOptionText: string;
        scoreChange: number;
        isPositive: boolean;
      }>;
      scenarioTitle: string;
      isWin: boolean;
    };

    const conversationLog = rounds
      .map(r => `第${r.roundNumber}轮：
对方说："${r.partnerMessage}"
用户选择了："${r.selectedOptionText}"（${r.isPositive ? '加分选项' : '减分选项'}，好感度变化${r.scoreChange > 0 ? '+' : ''}${r.scoreChange}）`)
      .join('\n\n');

    const messages = [
      { role: 'system' as const, content: REVIEW_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: `场景：${scenarioTitle}\n最终结果：${isWin ? '哄好了' : '没哄好'}\n\n以下是用户的完整对话记录：\n\n${conversationLog}\n\n请对用户的表现进行复盘评估。`,
      },
    ];

    const rawResponse = await callAiService('review', {
      model: resolveConfiguredModel('review', 'qwen3.6-flash-2026-04-16'),
      temperature: 0.3,
      max_tokens: 700,
      messages,
      timeoutMs: Number(process.env.AI_REVIEW_TIMEOUT_MS || 20000),
    }).catch(error => {
      console.error('Review API remote error:', error);
      return null;
    });

    let result: LLMReviewResponse;
    try {
      const content = extractTextFromAiResponse(rawResponse).trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      result = JSON.parse(jsonMatch[0]) as LLMReviewResponse;
    } catch {
      result = {
        emotionScore: 50,
        responsibilityScore: 50,
        remedyScore: 50,
        avoidanceScore: 50,
        totalComment: '复盘生成失败，请重新尝试。',
        reviewPoints: ['复盘数据解析异常'],
        practicalAdvice: ['先承认自己的错误，再说怎么补救'],
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Review API error:', error);
    return NextResponse.json(
      { error: '复盘生成失败' },
      { status: 500 }
    );
  }
}
