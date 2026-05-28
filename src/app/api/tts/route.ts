import { NextRequest, NextResponse } from 'next/server';
import {
  callAiService,
  extractAudioFromAiResponse,
  resolveConfiguredModel,
} from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, speakerId } = body as { text: string; speakerId: string };

    if (!text || !speakerId) {
      return NextResponse.json(
        { error: '缺少 text 或 speakerId 参数' },
        { status: 400 }
      );
    }

    const response = await callAiService('tts', {
      model: resolveConfiguredModel('tts', 'mimo-v2.5-tts'),
      audio: {
        format: 'mp3',
        voice: speakerId,
      },
      messages: [
        {
          role: 'assistant',
          content: text,
        },
      ],
    });
    const { audioUri, audioSize } = extractAudioFromAiResponse(response);

    return NextResponse.json({
      audioUri,
      audioSize,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    // TTS 失败不阻塞游戏，返回空音频标记
    return NextResponse.json({
      audioUri: null,
      audioSize: 0,
      error: '语音生成失败',
    });
  }
}
