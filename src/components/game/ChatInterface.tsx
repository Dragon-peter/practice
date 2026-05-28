'use client';

import { useEffect, useRef, useState } from 'react';
import type { ChatMessage as ChatMessageType, ChatOption } from '@/lib/game-types';
import { AffectionBar } from './AffectionBar';
import { ChatBubble } from './ChatBubble';
import { OptionsList } from './OptionsList';
import { useAudio } from '@/hooks/use-audio';
import { VOICE_OPTIONS } from '@/lib/game-constants';
import { VoicePickerSheet } from './VoicePickerSheet';

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
  onVoiceChange: (voiceId: string) => void;
  onExit: () => void;
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
  onVoiceChange,
  onExit,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { play, playPartnerMessage, stop, audioState } = useAudio();
  const audioUrlsRef = useRef<Record<string, string>>({});
  const [showVoicePicker, setShowVoicePicker] = useState(false);

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

  const currentVoiceLabel =
    VOICE_OPTIONS.find(v => v.id === voiceId)?.label ?? '默认语音';

  const handlePlayAudio = async (messageId: string, content: string) => {
    const cachedAudioUrl = audioUrlsRef.current[messageId];
    const isCurrentMessagePlaying =
      audioState.isPlaying && audioState.currentMessageId === messageId;

    if (isCurrentMessagePlaying) {
      stop();
      return;
    }

    if (cachedAudioUrl) {
      play(cachedAudioUrl, messageId);
      return;
    }

    const url = await playPartnerMessage(content, getSpeakerId(), messageId);
    if (url) {
      audioUrlsRef.current[messageId] = url;
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-[#EDEDED]">
      <div className="sticky top-0 z-20 bg-[#EDEDED] px-4 pb-2 pt-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[#1A1A1A]">正在哄 TA</div>
            <div className="mt-0.5 text-xs text-[#888]">当前语音：{currentVoiceLabel}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-white px-3 py-2 text-sm font-medium text-[#333] shadow-sm active:scale-[0.98]"
              onClick={() => {
                stop();
                setShowVoicePicker(true);
              }}
            >
              换语音
            </button>
            <button
              className="rounded-full bg-[#1A1A1A] px-3 py-2 text-sm font-medium text-white shadow-sm active:scale-[0.98]"
              onClick={() => {
                stop();
                onExit();
              }}
            >
              退出
            </button>
          </div>
        </div>
      </div>

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
            onPlayAudio={msg.role === 'partner' ? () => void handlePlayAudio(msg.id, msg.content) : undefined}
            isAudioPlaying={audioState.isPlaying && audioState.currentMessageId === msg.id}
            isAudioLoading={audioState.isLoading && audioState.loadingMessageId === msg.id}
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

      {showVoicePicker && (
        <VoicePickerSheet
          gender={gender}
          selectedVoiceId={voiceId}
          onSelect={onVoiceChange}
          onClose={() => setShowVoicePicker(false)}
        />
      )}
    </div>
  );
}
