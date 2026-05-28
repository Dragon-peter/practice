'use client';

import { getVoicesForGender } from '@/lib/game-constants';
import type { PartnerGender } from '@/lib/game-types';

interface VoiceSelectProps {
  gender: PartnerGender;
  onSelect: (voiceId: string) => void;
  onBack: () => void;
}

export function VoiceSelect({ gender, onSelect, onBack }: VoiceSelectProps) {
  const voices = getVoicesForGender(gender);

  return (
    <div className="flex flex-col min-h-screen bg-[#EDEDED]">
      {/* 顶栏 */}
      <div className="flex items-center px-4 py-3 bg-[#EDEDED]">
        <button
          onClick={onBack}
          className="text-[#07C160] text-base active:opacity-60"
        >
          返回
        </button>
        <h2 className="flex-1 text-center text-base font-semibold text-[#1A1A1A]">选择声音</h2>
        <div className="w-10" />
      </div>

      {/* 声音列表 */}
      <div className="flex-1 px-4 py-2 space-y-3">
        <p className="text-sm text-[#999] text-center mb-2">
          选一个对方说话的声音，游戏开始后还能改
        </p>
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onSelect(voice.id)}
            className="w-full bg-white rounded-xl p-4 text-left shadow-sm
              hover:shadow-md active:scale-[0.98] transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#07C160]/10 rounded-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07C160" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-[#1A1A1A]">
                  {voice.label}
                </h3>
                <p className="text-sm text-[#999]">
                  {voice.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
