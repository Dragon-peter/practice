'use client';

import { useState, useEffect } from 'react';
import { ConfettiEffect, HeartbreakEffect } from './Effects';
import { useAudio } from '@/hooks/use-audio';
import { VOICE_OPTIONS } from '@/lib/game-constants';

interface ResultScreenProps {
  isWin: boolean;
  affection: number;
  gender: 'girlfriend' | 'boyfriend';
  voiceId: string;
  onReview: () => void;
  onRetry: () => void;
}

export function ResultScreen({ isWin, affection, gender, voiceId, onReview, onRetry }: ResultScreenProps) {
  const [resultLine, setResultLine] = useState('');
  const [showContent, setShowContent] = useState(false);
  const { playPartnerMessage, audioState } = useAudio();

  // 获取对方结局台词
  useEffect(() => {
    const fetchLine = async () => {
      try {
        const res = await fetch('/api/result-line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isWin, gender, affection }),
        });
        const data = await res.json();
        setResultLine(data.line || (isWin ? '算了，原谅你了。' : '我走了。'));
      } catch {
        setResultLine(isWin ? '算了，原谅你了。' : '我走了。');
      }
    };
    fetchLine();
  }, [isWin, gender, affection]);

  // 延迟显示内容（等动画播完）
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // 播放结局语音
  const handlePlayLine = () => {
    if (resultLine) {
      const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
      const speakerId = voice?.speakerId ?? 'zh_female_meilinvyou_saturn_bigtts';
      playPartnerMessage(resultLine, speakerId);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#EDEDED] px-4">
      {/* 动画效果 */}
      {isWin && showContent && <ConfettiEffect />}
      {!isWin && <HeartbreakEffect />}

      {/* 主要内容 */}
      <div className={`w-full max-w-md text-center transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* 结果图标 */}
        <div className="text-6xl mb-4">
          {isWin ? '🥰' : '💔'}
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          {isWin ? '哄好了！' : '没哄好...'}
        </h2>

        {/* 好感度 */}
        <p className="text-sm text-[#999] mb-6">
          最终好感度：{affection}
        </p>

        {/* 对方台词 */}
        {resultLine && (
          <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <p className="text-base text-[#1A1A1A] leading-relaxed mb-2">
              &ldquo;{resultLine}&rdquo;
            </p>
            <button
              onClick={handlePlayLine}
              className="inline-flex items-center gap-1 text-xs text-[#07C160] hover:underline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {audioState.isPlaying ? (
                  <>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </>
                ) : (
                  <polygon points="5 3 19 12 5 21 5 3" />
                )}
              </svg>
              {audioState.isLoading ? '生成中' : audioState.isPlaying ? '暂停' : '播放语音'}
            </button>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3">
          {isWin && (
            <button
              onClick={onReview}
              className="w-full py-3.5 bg-[#07C160] text-white text-base font-semibold rounded-xl
                shadow-lg shadow-[#07C160]/30 hover:shadow-xl active:scale-[0.98] transition-all"
            >
              查看复盘
            </button>
          )}
          <button
            onClick={onRetry}
            className={`w-full py-3.5 text-base font-semibold rounded-xl transition-all active:scale-[0.98] ${
              isWin
                ? 'bg-white text-[#07C160] shadow-sm hover:shadow-md'
                : 'bg-[#07C160] text-white shadow-lg shadow-[#07C160]/30 hover:shadow-xl'
            }`}
          >
            {isWin ? '分享给朋友试试？' : '再试一次'}
          </button>
          {!isWin && (
            <button
              onClick={onReview}
              className="w-full py-3.5 bg-white text-[#666] text-base rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
            >
              查看复盘
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
