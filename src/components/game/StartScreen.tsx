'use client';

import type { PartnerGender } from '@/lib/game-types';

interface StartScreenProps {
  gender: PartnerGender;
  onGenderChange: (gender: PartnerGender) => void;
  onStart: () => void;
}

export function StartScreen({ gender, onGenderChange, onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#EDEDED] px-4">
      <div className="w-full max-w-md">
        {/* 标题区域 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-3">哄哄模拟器</h1>
          <p className="text-[#666] text-base leading-relaxed">
            练习更合适的沟通方式<br />
            在虚拟吵架中学会哄人
          </p>
        </div>

        {/* 性别选择 */}
        <div className="mb-8">
          <p className="text-center text-[#999] text-sm mb-4">对方是你的</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => onGenderChange('girlfriend')}
              className={`flex-1 py-4 rounded-xl text-lg font-medium transition-all duration-200 ${
                gender === 'girlfriend'
                  ? 'bg-[#07C160] text-white shadow-lg shadow-[#07C160]/30 scale-[1.02]'
                  : 'bg-white text-[#666] hover:bg-gray-50 active:scale-[0.98]'
              }`}
            >
              女朋友
            </button>
            <button
              onClick={() => onGenderChange('boyfriend')}
              className={`flex-1 py-4 rounded-xl text-lg font-medium transition-all duration-200 ${
                gender === 'boyfriend'
                  ? 'bg-[#07C160] text-white shadow-lg shadow-[#07C160]/30 scale-[1.02]'
                  : 'bg-white text-[#666] hover:bg-gray-50 active:scale-[0.98]'
              }`}
            >
              男朋友
            </button>
          </div>
        </div>

        {/* 开始按钮 */}
        <button
          onClick={onStart}
          className="w-full py-4 bg-[#07C160] text-white text-lg font-semibold rounded-xl
            shadow-lg shadow-[#07C160]/30 hover:shadow-xl hover:shadow-[#07C160]/40
            active:scale-[0.98] transition-all duration-200"
        >
          选择场景
        </button>

        {/* 底部提示 */}
        <p className="text-center text-[#999] text-xs mt-6">
          通过游戏化方式练习沟通技巧，不是教你说谎
        </p>
      </div>
    </div>
  );
}
