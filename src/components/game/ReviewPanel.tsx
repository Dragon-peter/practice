'use client';

import { useState, useEffect } from 'react';
import type { ReviewResult, GameRound } from '@/lib/game-types';

interface ReviewPanelProps {
  rounds: GameRound[];
  scenarioTitle: string;
  isWin: boolean;
  onRetry: () => void;
  onHome: () => void;
}

// 评分条组件
function ScoreBar({ label, score }: { label: string; score: number }) {
  const getColor = () => {
    if (score >= 80) return 'from-green-400 to-green-500';
    if (score >= 60) return 'from-lime-400 to-yellow-400';
    if (score >= 40) return 'from-yellow-400 to-orange-400';
    return 'from-orange-400 to-red-400';
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-[#666]">{label}</span>
        <span className="text-sm font-semibold text-[#1A1A1A]">{score}分</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor()} transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function ReviewPanel({ rounds, scenarioTitle, isWin, onRetry, onHome }: ReviewPanelProps) {
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rounds: rounds.map(r => ({
              roundNumber: r.roundNumber,
              partnerMessage: r.partnerMessage,
              selectedOptionText: r.selectedOptionText,
              scoreChange: r.scoreChange,
              isPositive: r.scoreChange > 0,
            })),
            scenarioTitle,
            isWin,
          }),
        });
        const data = await res.json();
        setReview(data as ReviewResult);
      } catch {
        setReview({
          emotionScore: 50,
          responsibilityScore: 50,
          remedyScore: 50,
          avoidanceScore: 50,
          totalScore: 50,
          totalComment: '复盘生成失败，请重新尝试。',
          reviewPoints: ['数据解析异常'],
          practicalAdvice: ['先承认错误，再给出补救方案'],
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchReview();
  }, [rounds, scenarioTitle, isWin]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#EDEDED]">
        <div className="flex gap-1 mb-4">
          <span className="w-3 h-3 bg-[#07C160] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-3 h-3 bg-[#07C160] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-3 h-3 bg-[#07C160] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-[#999]">正在生成复盘报告...</p>
      </div>
    );
  }

  if (!review) return null;

  const avgScore = Math.round(
    (review.emotionScore + review.responsibilityScore + review.remedyScore + review.avoidanceScore) / 4
  );

  return (
    <div className="min-h-screen bg-[#EDEDED]">
      {/* 顶栏 */}
      <div className="bg-[#EDEDED] px-4 py-3">
        <h2 className="text-center text-base font-semibold text-[#1A1A1A]">复盘报告</h2>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* 总分卡片 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-[#07C160] mb-1">{avgScore}</div>
            <div className="text-sm text-[#999]">综合评分</div>
          </div>

          <ScoreBar label="接住情绪" score={review.emotionScore} />
          <ScoreBar label="承认责任" score={review.responsibilityScore} />
          <ScoreBar label="补救方案" score={review.remedyScore} />
          <ScoreBar label="避免甩锅" score={review.avoidanceScore} />
        </div>

        {/* 总评 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-2">总评</h3>
          <p className="text-sm text-[#666] leading-relaxed">{review.totalComment}</p>
        </div>

        {/* 复盘点 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">复盘点</h3>
          <div className="space-y-3">
            {review.reviewPoints.map((point, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="flex-shrink-0 w-5 h-5 bg-[#07C160]/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs text-[#07C160] font-semibold">{idx + 1}</span>
                </div>
                <p className="text-sm text-[#666] leading-relaxed flex-1">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 实用建议 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">下次可以直接这样说</h3>
          <div className="space-y-2">
            {review.practicalAdvice.map((advice, idx) => (
              <div
                key={idx}
                className="bg-[#F0FFF4] border border-[#07C160]/20 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] leading-relaxed"
              >
                &ldquo;{advice}&rdquo;
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onRetry}
            className="w-full py-3.5 bg-[#07C160] text-white text-base font-semibold rounded-xl
              shadow-lg shadow-[#07C160]/30 hover:shadow-xl active:scale-[0.98] transition-all"
          >
            再试一次
          </button>
          <button
            onClick={onHome}
            className="w-full py-3.5 bg-white text-[#666] text-base rounded-xl shadow-sm
              hover:shadow-md active:scale-[0.98] transition-all"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
