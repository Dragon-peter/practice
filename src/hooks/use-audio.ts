'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface AudioState {
  isPlaying: boolean;
  currentAudioUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAudio() {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentAudioUrl: null,
    isLoading: false,
    error: null,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 请求 TTS
  const synthesize = useCallback(async (text: string, speakerId: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, speakerId }),
      });
      const data = await res.json();
      if (data.error) {
        setAudioState(prev => ({ ...prev, error: data.error }));
        return null;
      }
      return data.audioUri;
    } catch (err) {
      console.error('TTS synthesis error:', err);
      return null;
    }
  }, []);

  // 播放音频
  const play = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(url);
    audioRef.current = audio;

    setAudioState({ isPlaying: true, currentAudioUrl: url, isLoading: false, error: null });

    audio.onended = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    };
    audio.onerror = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false, error: '音频播放失败' }));
    };

    audio.play().catch(() => {
      setAudioState(prev => ({ ...prev, isPlaying: false, error: '音频播放失败' }));
    });
  }, []);

  // 停止播放
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // 自动播放对方消息的语音
  const playPartnerMessage = useCallback(async (text: string, speakerId: string) => {
    setAudioState(prev => ({ ...prev, isLoading: true }));
    const url = await synthesize(text, speakerId);
    if (url) {
      play(url);
    } else {
      setAudioState(prev => ({ ...prev, isLoading: false }));
    }
  }, [synthesize, play]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    audioState,
    play,
    stop,
    synthesize,
    playPartnerMessage,
  };
}
