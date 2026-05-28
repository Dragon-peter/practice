import { NextRequest, NextResponse } from 'next/server';
import type { LLMChatResponse } from '@/lib/game-types';
import { getEmotionDescription } from '@/lib/game-constants';
import {
  callAiService,
  extractTextFromAiResponse,
  resolveConfiguredModel,
} from '@/lib/ai-service';

const SYSTEM_PROMPT = `你是一个"哄哄模拟器"中扮演正在生气的伴侣的AI角色。

## 核心规则
1. 你必须全程用中文回复
2. 你扮演的角色正在生气，但情绪会随着好感度变化
3. 你的每轮回复必须包含：对方说的话 + 6个选项（2好4坏）
4. 对话必须和前文连续，像同一段真实聊天
5. 不允许重复题目和选项

## 情绪映射
对方的情绪取决于当前好感度：
- 好感度 ≤ 0：非常生气，冷暴力或激烈质问
- 好感度 1-30：还在生气，但愿意听你说
- 好感度 31-60：开始软化，语气缓和
- 好感度 61-80：快被哄好，可能带一点撒娇
- 好感度 > 80：已经原谅，但还会要个保证

## 选项设计规则（严格遵守）
每轮必须生成6个选项：
- 2个加分选项（category: "good"）：
  方向包括：真诚道歉、接住情绪、具体补救方案、提起共同回忆、给出后续承诺
  加分范围：+8 到 +15

- 2个普通减分选项（category: "bad_normal"）：
  方向包括：敷衍、转移话题、找借口、甩锅
  减分范围：-5 到 -10

- 2个搞笑减分选项（category: "bad_funny"）：
  方向包括：离谱但好笑的回复，保留娱乐性和传播感
  减分范围：-12 到 -20

选项顺序必须随机打乱，不要把加分项固定在同一位置。

## 输出格式
严格输出以下JSON，不要输出其他内容：
{
  "partnerMessage": "对方说的话",
  "options": [
    {"text": "选项文本", "isPositive": true/false, "scoreChange": 数字, "category": "good/bad_normal/bad_funny"},
    ... 共6个
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conflictBackground, initialEmotion, triggerLine, gender, affection, roundNumber, history, userMessage } = body as {
      conflictBackground: string;
      initialEmotion: string;
      triggerLine: string;
      gender: string;
      affection: number;
      roundNumber: number;
      history: Array<{ role: string; content: string }>;
      userMessage?: string;
    };

    const emotionDesc = getEmotionDescription(affection);
    const genderLabel = gender === 'girlfriend' ? '女朋友' : '男朋友';

    // 构建对话历史
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (roundNumber === 1) {
      // 第一轮：给出场景背景，让AI生成开场白+选项
      messages.push({
        role: 'user',
        content: `场景：${conflictBackground}\n对方性别：${genderLabel}\n初始情绪：${initialEmotion}\n当前好感度：${affection}（满分100）\n当前情绪状态：${emotionDesc}\n当前轮次：第${roundNumber}轮/共10轮\n\n请生成对方的第一句话和6个回复选项。对方的触发台词参考："${triggerLine}"，但请用自然的方式表达。`,
      });
    } else {
      // 后续轮：带上历史对话
      for (const msg of history) {
        messages.push({
          role: msg.role === 'partner' ? 'assistant' as const : 'user' as const,
          content: msg.content,
        });
      }
      messages.push({
        role: 'user',
        content: `当前好感度：${affection}（满分100）\n当前情绪状态：${emotionDesc}\n当前轮次：第${roundNumber}轮/共10轮\n\n用户选择了："${userMessage}"\n\n请生成对方对此的回应和6个新的回复选项。回应要自然连贯，体现情绪变化。`,
      });
    }

    const rawResponse = await callAiService('chat', {
      model: resolveConfiguredModel('chat', 'doubao-seed-2-0-lite-260215'),
      temperature: 0.8,
      messages,
    }).catch(error => {
      console.error('Chat API remote error:', error);
      return null;
    });

    // 解析 LLM 返回的 JSON
    let result: LLMChatResponse;
    try {
      const content = extractTextFromAiResponse(rawResponse).trim();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      result = JSON.parse(jsonMatch[0]) as LLMChatResponse;
    } catch {
      // JSON 解析失败时的兜底
      result = {
        partnerMessage: '你说什么？我没听清，你再说一遍。',
        options: [
          { text: '对不起，是我做得不好，我现在就改', isPositive: true, scoreChange: 10, category: 'good' },
          { text: '我真的很在乎你，给我个机会弥补', isPositive: true, scoreChange: 8, category: 'good' },
          { text: '你能不能别这么小题大做', isPositive: false, scoreChange: -8, category: 'bad_normal' },
          { text: '我上次不也是这样嘛，有什么大不了的', isPositive: false, scoreChange: -6, category: 'bad_normal' },
          { text: '我给你转了500块钱，去买杯奶茶消消气', isPositive: false, scoreChange: -15, category: 'bad_funny' },
          { text: '咱俩谁跟谁啊，明天你请我吃顿好的就扯平了', isPositive: false, scoreChange: -13, category: 'bad_funny' },
        ],
      };
    }

    // 为选项添加 ID 和打乱顺序
    const shuffled = result.options
      .map((opt, idx) => ({
        ...opt,
        id: `opt_${idx}`,
      }))
      .sort(() => Math.random() - 0.5);

    return NextResponse.json({
      partnerMessage: result.partnerMessage,
      options: shuffled,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: '对话生成失败，请重试' },
      { status: 500 }
    );
  }
}
