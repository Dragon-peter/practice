'use client';

import { useState, useEffect } from 'react';

interface AffectionBarProps {
  affection: number;
  round: number;
  maxRounds: number;
  lastChange?: number;
}

export function AffectionBar({ affection, round, maxRounds, lastChange }: AffectionBarProps) {
  // 将 -50~100 映射到 0~100% 的进度条
  const percentage = Math.max(0, Math.min(100, ((affection - (-50)) / 150) * 100));

  // 好感度颜色
  const getBarColor = () => {
    if (affection <= 0) return 'from-red-500 to-red-400';
    if (affection <= 30) return 'from-orange-500 to-yellow-400';
    if (affection <= 60) return 'from-yellow-400 to-lime-400';
    if (affection <= 80) return 'from-lime-400 to-green-400';
    return 'from-green-400 to-[#95EC69]';
  };

  // 分值变化动画
  const [showChange, setShowChange] = useState(false);
  const [changeValue, setChangeValue] = useState(0);

  useEffect(() => {
    if (lastChange !== undefined && lastChange !== 0) {
      setChangeValue(lastChange);
      setShowChange(true);
      const timer = setTimeout(() => setShowChange(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [lastChange, affection]);

  return (
    <div className="bg-[#EDEDED] px-4 py-2 sticky top-0 z-10">
      {/* 上方信息行 */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#999]">
          第 {round} 轮 / 共 {maxRounds} 轮
        </span>
        <div className="relative">
          <span className={`text-xs font-semibold ${
            affection <= 0 ? 'text-red-500' :
            affection <= 30 ? 'text-orange-500' :
            affection <= 60 ? 'text-yellow-600' :
            affection >= 80 ? 'text-green-500' : 'text-[#666]'
          }`}>
            好感度 {affection}
          </span>
          {/* 分值变化浮层 */}
          {showChange && (
            <span
              className={`absolute -top-5 left-1/2 -translate-x-1/2 text-sm font-bold animate-float-up ${
                changeValue > 0 ? 'text-[#52C41A]' : 'text-[#FF4D4F]'
              }`}
            >
              {changeValue > 0 ? '+' : ''}{changeValue}
            </span>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="h-2 bg-white/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 胜负线标记 */}
      <div className="relative h-0">
        <div
          className="absolute top-0 w-0.5 h-2 bg-green-500/40"
          style={{ left: `${((80 - (-50)) / 150) * 100}%` }}
        />
      </div>
    </div>
  );
}
