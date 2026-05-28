'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage as ChatMessageType } from '@/lib/game-types';

interface ChatBubbleProps {
  message: ChatMessageType;
  gender: 'girlfriend' | 'boyfriend';
  isNew?: boolean;
  onPlayAudio?: () => void;
  hasAudio?: boolean;
  isAudioPlaying?: boolean;
  isAudioLoading?: boolean;
}

// SVG 头像组件
function PartnerAvatar({ gender }: { gender: 'girlfriend' | 'boyfriend' }) {
  if (gender === 'girlfriend') {
    return (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
        <circle cx="20" cy="20" r="20" fill="#FFE4E6" />
        <circle cx="20" cy="15" r="7" fill="#F9A8D4" />
        <ellipse cx="14" cy="13" rx="3" ry="5" fill="#F9A8D4" />
        <ellipse cx="26" cy="13" rx="3" ry="5" fill="#F9A8D4" />
        <circle cx="17" cy="15" r="1.2" fill="#1A1A1A" />
        <circle cx="23" cy="15" r="1.2" fill="#1A1A1A" />
        <path d="M18 19 Q20 21 22 19" stroke="#F472B6" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <ellipse cx="20" cy="32" rx="10" ry="8" fill="#FBCFE8" />
      </svg>
    );
  }
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <circle cx="20" cy="20" r="20" fill="#DBEAFE" />
      <circle cx="20" cy="15" r="7" fill="#93C5FD" />
      <rect x="14" y="8" width="12" height="4" rx="2" fill="#60A5FA" />
      <circle cx="17" cy="15" r="1.2" fill="#1A1A1A" />
      <circle cx="23" cy="15" r="1.2" fill="#1A1A1A" />
      <path d="M17 19 L23 19" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="20" cy="32" rx="10" ry="8" fill="#BFDBFE" />
    </svg>
  );
}

function UserAvatar() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="flex-shrink-0">
      <circle cx="20" cy="20" r="20" fill="#F3F4F6" />
      <circle cx="20" cy="15" r="7" fill="#D1D5DB" />
      <circle cx="17" cy="15" r="1.2" fill="#1A1A1A" />
      <circle cx="23" cy="15" r="1.2" fill="#1A1A1A" />
      <path d="M17 19 Q20 21 23 19" stroke="#9CA3AF" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="32" rx="10" ry="8" fill="#E5E7EB" />
    </svg>
  );
}

export function ChatBubble({ message, gender, isNew, onPlayAudio, hasAudio, isAudioPlaying, isAudioLoading }: ChatBubbleProps) {
  const isPartner = message.role === 'partner';
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setAnimated(true), 30);
      return () => clearTimeout(timer);
    } else {
      setAnimated(true);
    }
  }, [isNew]);

  return (
    <div
      className={`flex gap-2 mb-3 transition-all duration-300 ${
        isPartner ? 'flex-row' : 'flex-row-reverse'
      } ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
    >
      {/* 头像 */}
      <div className="flex-shrink-0 mt-1">
        {isPartner ? <PartnerAvatar gender={gender} /> : <UserAvatar />}
      </div>

      {/* 气泡 */}
      <div className={`max-w-[75%] ${isPartner ? 'items-start' : 'items-end'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
            isPartner
              ? 'bg-white text-[#1A1A1A] rounded-tl-sm'
              : 'bg-[#95EC69] text-[#1A1A1A] rounded-tr-sm'
          }`}
        >
          {message.content}
        </div>

        {/* 语音播放按钮 */}
        {isPartner && hasAudio && onPlayAudio && (
          <button
            onClick={onPlayAudio}
            className="mt-1 flex items-center gap-1 text-xs text-[#999] hover:text-[#07C160] transition-colors"
          >
            {isAudioLoading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.4" strokeDashoffset="10" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isAudioPlaying ? (
                  <>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </>
                ) : (
                  <polygon points="5 3 19 12 5 21 5 3" />
                )}
              </svg>
            )}
            {isAudioLoading ? '生成中' : isAudioPlaying ? '暂停' : '播放'}
          </button>
        )}
      </div>
    </div>
  );
}
