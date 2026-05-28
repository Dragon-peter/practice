'use client';

import { SCENARIOS } from '@/lib/game-constants';

interface SceneSelectProps {
  onSelect: (scenarioId: string) => void;
  onBack: () => void;
}

export function SceneSelect({ onSelect, onBack }: SceneSelectProps) {
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
        <h2 className="flex-1 text-center text-base font-semibold text-[#1A1A1A]">选择场景</h2>
        <div className="w-10" />
      </div>

      {/* 场景列表 */}
      <div className="flex-1 px-4 py-2 space-y-3">
        {SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario.id)}
            className="w-full bg-white rounded-xl p-4 text-left shadow-sm
              hover:shadow-md active:scale-[0.98] transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{scenario.emoji}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">
                  {scenario.title}
                </h3>
                <p className="text-sm text-[#999] leading-relaxed">
                  {scenario.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
