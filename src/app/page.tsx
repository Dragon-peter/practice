'use client';

import { useCallback, useState, useRef } from 'react';
import { useGameState } from '@/hooks/use-game-state';
import { StartScreen } from '@/components/game/StartScreen';
import { SceneSelect } from '@/components/game/SceneSelect';
import { VoiceSelect } from '@/components/game/VoiceSelect';
import { ChatInterface } from '@/components/game/ChatInterface';
import { ResultScreen } from '@/components/game/ResultScreen';
import { ReviewPanel } from '@/components/game/ReviewPanel';
import { SCENARIOS, AFFECTION_INITIAL } from '@/lib/game-constants';
import type { ChatOption } from '@/lib/game-types';

export default function HomePage() {
  const {
    state,
    setGender,
    setScenario,
    setVoice,
    setPhase,
    startGame,
    addPartnerMessage,
    addUserMessage,
    processRound,
    incrementRound,
    setLoading,
    goToReview,
    resetGame,
  } = useGameState();

  const currentOptionsRef = useRef<ChatOption[]>([]);
  const [currentOptions, setCurrentOptions] = useState<ChatOption[]>([]);
  const [lastChange, setLastChange] = useState<number>(0);
  const partnerMessageRef = useRef<string>('');

  // 请求一轮对话
  const fetchRound = useCallback(async (
    scenarioId: string,
    gender: string,
    currentAffection: number,
    roundNum: number,
    history: Array<{ role: string; content: string }>,
    userMessage?: string,
  ) => {
    setLoading(true);
    setCurrentOptions([]);

    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: scenario.id,
          conflictBackground: scenario.conflictBackground,
          initialEmotion: scenario.initialEmotion,
          triggerLine: scenario.triggerLine,
          gender,
          affection: currentAffection,
          roundNumber: roundNum,
          history,
          userMessage,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const { partnerMessage, options } = data;
      addPartnerMessage(partnerMessage, options);
      partnerMessageRef.current = partnerMessage;

      currentOptionsRef.current = options;
      setCurrentOptions(options);
    } catch (err) {
      console.error('Fetch round error:', err);
      addPartnerMessage('你说什么？我没听清。');
      const fallbackOptions: ChatOption[] = [
        { id: 'f1', text: '对不起，是我不好', isPositive: true, scoreChange: 10, category: 'good' },
        { id: 'f2', text: '我真的很在乎你', isPositive: true, scoreChange: 8, category: 'good' },
        { id: 'f3', text: '你能不能别这样', isPositive: false, scoreChange: -8, category: 'bad_normal' },
        { id: 'f4', text: '我也不想这样的', isPositive: false, scoreChange: -6, category: 'bad_normal' },
        { id: 'f5', text: '给你发个红包消消气', isPositive: false, scoreChange: -15, category: 'bad_funny' },
        { id: 'f6', text: '要不咱俩互相伤害呗', isPositive: false, scoreChange: -13, category: 'bad_funny' },
      ];
      currentOptionsRef.current = fallbackOptions;
      setCurrentOptions(fallbackOptions);
    } finally {
      setLoading(false);
    }
  }, [addPartnerMessage, setLoading]);

  // 处理选择选项
  const handleSelectOption = useCallback((option: ChatOption) => {
    addUserMessage(option.text);

    const result = processRound(
      partnerMessageRef.current,
      currentOptionsRef.current,
      option,
    );

    setLastChange(option.scoreChange);
    setCurrentOptions([]);
    currentOptionsRef.current = [];

    // 游戏没结束则继续下一轮
    if (result.isWin === null) {
      const nextRound = state.currentRound + 1;
      incrementRound();
      const newAffection = result.newAffection;
      const updatedMessages = [
        ...state.messages,
        { role: 'partner' as const, content: partnerMessageRef.current },
        { role: 'user' as const, content: option.text },
      ];
      setTimeout(() => {
        fetchRound(
          state.scenarioId,
          state.gender,
          newAffection,
          nextRound + 1,
          updatedMessages.map(m => ({ role: m.role, content: m.content })),
          option.text,
        );
      }, 800);
    }
  }, [addUserMessage, processRound, fetchRound, state, incrementRound]);

  // 从声音选择页启动游戏
  const handleStartFromVoice = useCallback((voiceId: string) => {
    setVoice(voiceId);
    startGame();
    incrementRound();
    // 获取场景信息后请求第一轮
    const scenario = SCENARIOS.find(s => s.id === state.scenarioId);
    if (scenario) {
      setTimeout(() => {
        fetchRound(state.scenarioId, state.gender, AFFECTION_INITIAL, 1, []);
      }, 200);
    }
  }, [setVoice, startGame, incrementRound, fetchRound, state.scenarioId, state.gender]);

  // 重试同场景
  const handleRetry = useCallback(() => {
    startGame();
    incrementRound();
    setLastChange(0);
    setCurrentOptions([]);
    currentOptionsRef.current = [];
    setTimeout(() => {
      fetchRound(state.scenarioId, state.gender, AFFECTION_INITIAL, 1, []);
    }, 100);
  }, [startGame, incrementRound, fetchRound, state.scenarioId, state.gender]);

  // 渲染
  switch (state.phase) {
    case 'start':
      return (
        <StartScreen
          gender={state.gender}
          onGenderChange={setGender}
          onStart={() => setPhase('scene')}
        />
      );

    case 'scene':
      return (
        <SceneSelect
          onSelect={(id) => {
            setScenario(id);
            setPhase('voice');
          }}
          onBack={() => setPhase('start')}
        />
      );

    case 'voice':
      return (
        <VoiceSelect
          gender={state.gender}
          onSelect={handleStartFromVoice}
          onBack={() => setPhase('scene')}
        />
      );

    case 'playing':
      return (
        <ChatInterface
          messages={state.messages}
          currentOptions={currentOptions}
          affection={state.affection}
          round={state.currentRound}
          maxRounds={state.maxRounds}
          lastChange={lastChange}
          gender={state.gender}
          voiceId={state.voiceId}
          isLoading={state.isLoading}
          onSelectOption={handleSelectOption}
        />
      );

    case 'result':
      return (
        <ResultScreen
          isWin={state.isWin === true}
          affection={state.affection}
          gender={state.gender}
          voiceId={state.voiceId}
          onReview={goToReview}
          onRetry={handleRetry}
        />
      );

    case 'review':
      return (
        <ReviewPanel
          rounds={state.rounds}
          scenarioTitle={SCENARIOS.find(s => s.id === state.scenarioId)?.title ?? ''}
          isWin={state.isWin === true}
          onRetry={handleRetry}
          onHome={resetGame}
        />
      );

    default:
      return null;
  }
}
