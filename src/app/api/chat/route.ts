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
6. 回复风格要像手机即时通讯，少解释、少铺垫

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

## 文案长度要求（严格遵守）
- partnerMessage 控制在 2-3 句内，整体约 40-70 个汉字
- 语气自然口语化，避免长段说明和过度抒情
- 每个 option.text 尽量控制在 12-24 个汉字
- 选项要像聊天里会直接发出去的话，不要写成长句和复合句

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
        content: `当前好感度：${affection}（满分100）\n当前情绪状态：${emotionDesc}\n当前轮次：第${roundNumber}轮/共10轮\n\n用户选择了："${userMessage}"\n\n请生成对方对此的回应和6个新的回复选项。回应要自然连贯，体现情绪变化，并保持移动端聊天的简短节奏。`,
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
          { text: '对不起，这次是我没做好', isPositive: true, scoreChange: 10, category: 'good' },
          { text: '你先别难受，我来补救', isPositive: true, scoreChange: 8, category: 'good' },
          { text: '你别老揪着这事不放', isPositive: false, scoreChange: -8, category: 'bad_normal' },
          { text: '我也不是故意的啊', isPositive: false, scoreChange: -6, category: 'bad_normal' },
          { text: '要不我磕一个谢罪？', isPositive: false, scoreChange: -15, category: 'bad_funny' },
          { text: '给你点杯奶茶就翻篇？', isPositive: false, scoreChange: -13, category: 'bad_funny' },
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
