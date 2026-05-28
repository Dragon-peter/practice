// 游戏核心类型定义

export type GamePhase =
  | 'start'       // 性别选择
  | 'scene'       // 场景选择
  | 'voice'       // 声音选择
  | 'playing'     // 对话进行中
  | 'result'      // 结算页（成功/失败）
  | 'review';     // 复盘页

export type PartnerGender = 'girlfriend' | 'boyfriend';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  emoji: string;
  conflictBackground: string;   // 冲突背景描述
  initialEmotion: string;       // 初始情绪状态
  triggerLine: string;          // 对方第一句话
}

export interface VoiceOption {
  id: string;
  label: string;
  speakerId: string;
  description: string;
  gender: PartnerGender;
}

export interface ChatOption {
  id: string;
  text: string;
  isPositive: boolean;          // 加分/减分
  scoreChange: number;          // 分值变化
  category: 'good' | 'bad_normal' | 'bad_funny';
}

export interface ChatMessage {
  id: string;
  role: 'partner' | 'user';
  content: string;
  audioUrl?: string;            // TTS 音频地址
  options?: ChatOption[];       // 仅 user 消息前一条 partner 消息携带
}

export interface GameRound {
  roundNumber: number;
  partnerMessage: string;
  options: ChatOption[];
  selectedOptionId?: string;
  selectedOptionText?: string;
  scoreChange: number;
  affectionAfter: number;
}

export interface GameState {
  phase: GamePhase;
  gender: PartnerGender;
  scenarioId: string;
  voiceId: string;
  currentRound: number;
  maxRounds: number;
  affection: number;
  rounds: GameRound[];
  messages: ChatMessage[];
  isWin: boolean | null;
  isLoading: boolean;
}

export interface ReviewResult {
  emotionScore: number;         // 是否先接住情绪 0-100
  responsibilityScore: number;  // 是否承认责任 0-100
  remedyScore: number;          // 是否给出补救方案 0-100
  avoidanceScore: number;       // 是否避免甩锅和反击 0-100
  totalScore: number;
  totalComment: string;
  reviewPoints: string[];       // 至少3条复盘点
  practicalAdvice: string[];    // 可直接照着说的话术
}

// LLM 返回的结构
export interface LLMChatResponse {
  partnerMessage: string;
  options: Array<{
    text: string;
    isPositive: boolean;
    scoreChange: number;
    category: 'good' | 'bad_normal' | 'bad_funny';
  }>;
}

export interface LLMReviewResponse {
  emotionScore: number;
  responsibilityScore: number;
  remedyScore: number;
  avoidanceScore: number;
  totalComment: string;
  reviewPoints: string[];
  practicalAdvice: string[];
}

export interface LLMResultLineResponse {
  line: string;
}
