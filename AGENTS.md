# 哄哄模拟器 - 项目文档

## 项目概览
哄哄模拟器是一个网页版互动游戏，帮助用户在虚拟冲突场景中练习更合适的沟通方式。用户选择场景后，AI 扮演正在生气的伴侣，通过选择回复选项来哄好对方。

## 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui + 自定义微信风格组件
- **Styling**: Tailwind CSS 4
- **AI**: coze-coding-dev-sdk (LLMClient + TTSClient)

## 目录结构
```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # LLM 对话生成（对方台词+6选项）
│   │   ├── tts/route.ts          # TTS 语音合成
│   │   ├── review/route.ts       # 复盘评估
│   │   └── result-line/route.ts  # 结局台词生成
│   ├── globals.css               # 全局样式 + 自定义动画
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 主页面（SPA，状态机驱动）
├── components/
│   ├── game/
│   │   ├── StartScreen.tsx       # 性别选择首页
│   │   ├── SceneSelect.tsx       # 场景选择页
│   │   ├── VoiceSelect.tsx       # 声音选择页
│   │   ├── ChatInterface.tsx     # 微信风格聊天主界面
│   │   ├── ChatBubble.tsx        # 聊天气泡 + SVG头像
│   │   ├── AffectionBar.tsx      # 好感度进度条
│   │   ├── OptionsList.tsx       # 6选项列表
│   │   ├── ResultScreen.tsx      # 结算页（成功/失败）
│   │   ├── ReviewPanel.tsx       # 复盘面板
│   │   └── Effects.tsx           # 撒花/心碎动画
│   └── ui/                       # shadcn/ui 组件库
├── hooks/
│   ├── use-game-state.ts         # 游戏状态管理 Hook
│   └── use-audio.ts              # 音频播放 Hook
├── lib/
│   ├── game-types.ts             # 类型定义
│   ├── game-constants.ts         # 常量（场景、声音、好感度参数）
│   └── utils.ts                  # 工具函数
```

## 游戏状态流转
```
start → scene → voice → playing → result → review
  ↑                                   ↓
  └─────────────── resetGame ──────────┘
```

## 核心游戏参数
- 好感度初始值: 20
- 好感度范围: -50 ~ 100
- 通关条件: 好感度 ≥ 80
- 失败条件: 好感度 ≤ -50 或 10轮内未达80
- 每轮选项: 6个（2好 + 2普通坏 + 2搞笑坏）

## 构建与测试命令
- 开发: `pnpm dev`
- 构建: `pnpm build`
- 类型检查: `pnpm ts-check`
- 代码检查: `pnpm lint`
- 启动生产: `pnpm start`

## API 接口
1. `POST /api/chat` - 生成对方台词和6个选项
2. `POST /api/tts` - 文字转语音
3. `POST /api/review` - 生成复盘评估
4. `POST /api/result-line` - 生成结局台词

## 设计规范
详见 DESIGN.md - 微信聊天风格，主色 #07C160，好感度从红到绿渐变
