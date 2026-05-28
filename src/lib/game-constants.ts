// 游戏常量：场景、声音映射、好感度参数等

import type { Scenario, VoiceOption } from './game-types';

// 好感度参数
export const AFFECTION_INITIAL = 20;
export const AFFECTION_MAX = 100;
export const AFFECTION_MIN = -50;
export const AFFECTION_WIN = 80;
export const MAX_ROUNDS = 10;

// 预设场景
export const SCENARIOS: Scenario[] = [
  {
    id: 'anniversary',
    title: '忘记纪念日',
    description: '你竟然把最重要的日子忘了',
    emoji: '💔',
    conflictBackground: '今天是你们在一起两周年的纪念日，但你完全忘记了，不仅没有准备礼物，还加班到很晚才回家。对方精心准备了一桌子菜，等你等到饭菜都凉了。',
    initialEmotion: '极度失望和委屈，眼眶泛红，但不想让你觉得她在无理取闹',
    triggerLine: '你终于舍得回来了？看看桌上那些菜，凉了两个多小时了。',
  },
  {
    id: 'no-reply',
    title: '深夜不回消息',
    description: '已读不回的深夜',
    emoji: '📱',
    conflictBackground: '凌晨一点，对方发消息说身体不舒服想让你陪，你看到了消息但因为打游戏没有回复。第二天早上对方已经不接你电话了。',
    initialEmotion: '愤怒且心寒，觉得在你心里游戏比ta重要',
    triggerLine: '昨晚你的游戏段位应该升了不少吧？比我的消息重要多了。',
  },
  {
    id: 'chatting-other',
    title: '被发现和异性聊天',
    description: '那些暧昧的聊天记录',
    emoji: '🔥',
    conflictBackground: '对方无意间看到你的手机，发现你和一个异性同事/朋友最近聊天很频繁，虽然内容不算出格，但语气暧昧，还有很多深夜的对话记录。',
    initialEmotion: '愤怒中带着不安和嫉妒，需要你给出明确的解释和态度',
    triggerLine: '你跟我说说，这个天天深夜找你聊天的人是谁？',
  },
  {
    id: 'lost-cat',
    title: '把对方的猫弄丢了',
    description: '那是ta养了三年的猫',
    emoji: '🐱',
    conflictBackground: '对方出差让你帮忙照顾猫，你出门倒垃圾没关好门，猫跑出去了。找了一整天没找到，对方出差回来才知道这件事。',
    initialEmotion: '崩溃、心痛到极点，那只猫是对方最亲密的伙伴',
    triggerLine: '我的猫呢？你告诉我我的猫在哪里？！',
  },
  {
    id: 'public-embarrassment',
    title: '当众让对方没面子',
    description: '朋友面前的那些话',
    emoji: '😳',
    conflictBackground: '在朋友聚餐时，你当着所有人的面吐槽对方的一个缺点，还把对方的糗事当笑话讲。当时朋友们都笑了，但对方脸色很难看，饭没吃完就找借口离开了。',
    initialEmotion: '羞辱感和被背叛的感觉，觉得你不尊重自己',
    triggerLine: '昨天在饭桌上你笑得很开心是吧？拿我取乐好玩吗？',
  },
  {
    id: 'gaming-while-sick',
    title: '身体不舒服还在打游戏',
    description: '我需要你的时候你在哪里',
    emoji: '🎮',
    conflictBackground: '对方发烧到38.5度，给你打电话说很难受想让你回来，你说"马上"但又一局接一局打了两个小时。等回来的时候对方已经自己去了医院。',
    initialEmotion: '寒心，觉得自己在你心里排不上号',
    triggerLine: '我在医院挂了两个小时的点滴，你在推塔。挺好的。',
  },
];

// 声音选项
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'gentle-female',
    label: '温柔女声',
    speakerId: '茉莉',
    description: '轻柔细腻，像哄你说话',
    gender: 'girlfriend',
  },
  {
    id: 'bossy-female',
    label: '霸道御姐',
    speakerId: '白桦',
    description: '气场十足，不好惹',
    gender: 'girlfriend',
  },
  {
    id: 'cute-female',
    label: '可爱软妹',
    speakerId: '冰糖',
    description: '奶凶奶凶的，气鼓鼓',
    gender: 'girlfriend',
  },
  {
    id: 'deep-male',
    label: '低沉男声',
    speakerId: 'Dean',
    description: '声音低沉，压迫感强',
    gender: 'boyfriend',
  },
  {
    id: 'gentle-male',
    label: '温柔男声',
    speakerId: 'Milo',
    description: '温和但严肃，像在讲道理',
    gender: 'boyfriend',
  },
];

// 根据 gender 筛选可用声音
export function getVoicesForGender(gender: string): VoiceOption[] {
  return VOICE_OPTIONS.filter(v => v.gender === gender);
}

// 情绪区间描述（用于 prompt）
export function getEmotionDescription(affection: number): string {
  if (affection <= 0) {
    return '非常生气，冷暴力或激烈质问，语气尖锐，可能会说"随便你""不想理你"之类的话';
  }
  if (affection <= 30) {
    return '还在生气，但愿意听你说，语气冷硬但不是完全封闭，可能会说"你说吧""我听着呢"';
  }
  if (affection <= 60) {
    return '开始软化，语气缓和了一些，不再那么尖锐，可能会带一点委屈地说"你早干嘛去了"';
  }
  if (affection <= 80) {
    return '快被哄好了，可能带一点撒娇，语气变甜但还会要个保证，可能会说"你保证下次不会再这样了？"';
  }
  return '已经原谅，但还会要一个承诺或补偿，可能会说"那你要补偿我"';
}
