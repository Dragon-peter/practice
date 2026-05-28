'use client';

import type { ChatOption } from '@/lib/game-types';

interface OptionsListProps {
  options: ChatOption[];
  onSelect: (option: ChatOption) => void;
  disabled: boolean;
}

export function OptionsList({ options, onSelect, disabled }: OptionsListProps) {
  return (
    <div className="bg-[#F5F5F5] px-3 py-3 border-t border-[#D9D9D9]">
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            disabled={disabled}
            className={`text-left px-3 py-3 rounded-xl text-sm leading-snug transition-all duration-150
              bg-white text-[#333] shadow-sm
              ${disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md active:scale-[0.97] active:bg-gray-50'
              }`}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}
