'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType, ChatOption } from '@/lib/game-types';
import { AffectionBar } from './AffectionBar';
import { ChatBubble } from './ChatBubble';
import { OptionsList } from './OptionsList';
import { useAudio } from '@/hooks/use-audio';
import { VOICE_OPTIONS } from '@/lib/game-constants';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  currentOptions: ChatOption[];
  affection: number;
  round: number;
  maxRounds: number;
  lastChange?: number;
  gender: 'girlfriend' | 'boyfriend';
  voiceId: string;
  isLoading: boolean;
  onSelectOption: (option: ChatOption) => void;
}

export function ChatInterface({
  messages,
  currentOptions,
  affection,
  round,
  maxRounds,
  lastChange,
  gender,
  voiceId,
  isLoading,
  onSelectOption,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { playPartnerMessage, audioState } = useAudio();
  const audioUrlsRef = useRef<Record<string, string>>({});

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 获取声音 speakerId
  const getSpeakerId = () => {
    const voice = VOICE_OPTIONS.find(v => v.id === voiceId);
    return voice?.speakerId ?? 'zh_female_meilinvyou_saturn_bigtts';
  };

  // 当对方有新消息时，自动生成 TTS
  const handlePlayAudio = (messageId: string, content: string) => {
    if (audioUrlsRef.current[messageId]) {
      // 已有音频URL，直接播放
      return;
    }
    playPartnerMessage(content, getSpeakerId());
  };

  return (
    <div className="flex flex-col h-screen bg-[#EDEDED]">
      {/* 好感度进度条 */}
      <AffectionBar affection={affection} round={round} maxRounds={maxRounds} lastChange={lastChange} />

      {/* 聊天区域 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-2"
      >
        {messages.map((msg, idx) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            gender={gender}
            isNew={idx === messages.length - 1}
            hasAudio={msg.role === 'partner'}
            onPlayAudio={msg.role === 'partner' ? () => handlePlayAudio(msg.id, msg.content) : undefined}
            isAudioPlaying={audioState.isPlaying && audioState.currentAudioUrl !== null}
            isAudioLoading={audioState.isLoading}
          />
        ))}

        {/* 加载动画 */}
        {isLoading && (
          <div className="flex gap-2 mb-3 items-end">
            <div className="flex-shrink-0">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill={gender === 'girlfriend' ? '#FFE4E6' : '#DBEAFE'} />
                <circle cx="20" cy="15" r="7" fill={gender === 'girlfriend' ? '#F9A8D4' : '#93C5FD'} />
              </svg>
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#999] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#999] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#999] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 选项区域 */}
      {!isLoading && currentOptions.length > 0 && (
        <OptionsList
          options={currentOptions}
          onSelect={onSelectOption}
          disabled={isLoading}
        />
      )}

      {/* 等待加载时底部占位 */}
      {isLoading && (
        <div className="bg-[#F5F5F5] px-3 py-3 border-t border-[#D9D9D9]">
          <div className="text-center text-sm text-[#999] py-4">
            正在思考...
          </div>
        </div>
      )}
    </div>
  );
}
