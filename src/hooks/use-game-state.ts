'use client';

import { useState, useCallback, useRef } from 'react';
import type { GamePhase, PartnerGender, GameState, GameRound, ChatMessage, ChatOption, ReviewResult } from '@/lib/game-types';
import { AFFECTION_INITIAL, AFFECTION_WIN, AFFECTION_MIN, MAX_ROUNDS, SCENARIOS } from '@/lib/game-constants';

const initialState: GameState = {
  phase: 'start',
  gender: 'girlfriend',
  scenarioId: '',
  voiceId: '',
  currentRound: 0,
  maxRounds: MAX_ROUNDS,
  affection: AFFECTION_INITIAL,
  rounds: [],
  messages: [],
  isWin: null,
  isLoading: false,
};

export function useGameState() {
  const [state, setState] = useState<GameState>(initialState);
  const reviewRef = useRef<ReviewResult | null>(null);

  const setPhase = useCallback((phase: GamePhase) => {
    setState(prev => ({ ...prev, phase }));
  }, []);

  const setGender = useCallback((gender: PartnerGender) => {
    setState(prev => ({ ...prev, gender }));
  }, []);

  const setScenario = useCallback((scenarioId: string) => {
    setState(prev => ({ ...prev, scenarioId }));
  }, []);

  const setVoice = useCallback((voiceId: string) => {
    setState(prev => ({ ...prev, voiceId }));
  }, []);

  const startGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'playing',
      currentRound: 0,
      affection: AFFECTION_INITIAL,
      rounds: [],
      messages: [],
      isWin: null,
      isLoading: false,
    }));
  }, []);

  const addPartnerMessage = useCallback((content: string, options?: ChatOption[]) => {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_partner`,
      role: 'partner',
      content,
      options,
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, msg],
    }));
    return msg;
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
    };
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, msg],
    }));
  }, []);

  const processRound = useCallback((
    partnerMessage: string,
    options: ChatOption[],
    selectedOption: ChatOption,
  ) => {
    const newAffection = Math.max(AFFECTION_MIN, Math.min(100, state.affection + selectedOption.scoreChange));
    const newRound: GameRound = {
      roundNumber: state.currentRound,
      partnerMessage,
      options,
      selectedOptionId: selectedOption.id,
      selectedOptionText: selectedOption.text,
      scoreChange: selectedOption.scoreChange,
      affectionAfter: newAffection,
    };

    // 检查胜负
    let isWin: boolean | null = null;
    let phase: GamePhase = 'playing';

    if (newAffection >= AFFECTION_WIN) {
      isWin = true;
      phase = 'result';
    } else if (newAffection <= AFFECTION_MIN) {
      isWin = false;
      phase = 'result';
    } else if (state.currentRound >= MAX_ROUNDS) {
      isWin = false;
      phase = 'result';
    }

    setState(prev => ({
      ...prev,
      affection: newAffection,
      rounds: [...prev.rounds, newRound],
      isWin,
      phase,
      isLoading: false,
    }));

    return { newAffection, isWin };
  }, [state.affection, state.currentRound]);

  const incrementRound = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const goToReview = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'review' }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
    reviewRef.current = null;
  }, []);

  const resetToStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      phase: 'start',
      currentRound: 0,
      affection: AFFECTION_INITIAL,
      rounds: [],
      messages: [],
      isWin: null,
      isLoading: false,
    }));
    reviewRef.current = null;
  }, []);

  return {
    state,
    reviewRef,
    setPhase,
    setGender,
    setScenario,
    setVoice,
    startGame,
    addPartnerMessage,
    addUserMessage,
    processRound,
    incrementRound,
    setLoading,
    goToReview,
    resetGame,
    resetToStart,
  };
}
