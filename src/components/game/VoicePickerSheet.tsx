'use client';

import { getVoicesForGender } from '@/lib/game-constants';
import type { PartnerGender } from '@/lib/game-types';

interface VoicePickerSheetProps {
  gender: PartnerGender;
  selectedVoiceId: string;
  onSelect: (voiceId: string) => void;
  onClose: () => void;
}

export function VoicePickerSheet({
  gender,
  selectedVoiceId,
  onSelect,
  onClose,
}: VoicePickerSheetProps) {
  const voices = getVoicesForGender(gender);

  return (
    <div className="absolute inset-0 z-30 flex items-end bg-black/25">
      <button
        aria-label="关闭语音选择"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full rounded-t-3xl bg-[#F7F7F7] px-4 pb-6 pt-4 shadow-2xl">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#D9D9D9]" />
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#1A1A1A]">更换语音</h3>
            <p className="mt-1 text-xs text-[#888]">只影响后续语音播放，不重开当前对话</p>
          </div>
          <button
            className="rounded-full bg-white px-3 py-1.5 text-sm text-[#666] shadow-sm active:scale-[0.98]"
            onClick={onClose}
          >
            关闭
          </button>
        </div>

        <div className="space-y-3">
          {voices.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            return (
              <button
                key={voice.id}
                onClick={() => {
                  onSelect(voice.id);
                  onClose();
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-150 ${
                  isSelected
                    ? 'border-[#07C160] bg-[#F0FFF4] shadow-sm'
                    : 'border-transparent bg-white shadow-sm active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#1A1A1A]">{voice.label}</div>
                    <div className="mt-1 text-xs leading-relaxed text-[#777]">{voice.description}</div>
                  </div>
                  <div
                    className={`flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isSelected ? 'bg-[#07C160] px-2 text-white' : 'bg-[#F2F2F2] px-2 text-[#999]'
                    }`}
                  >
                    {isSelected ? '当前' : '选择'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
