# 哄哄模拟器

一个基于 Next.js 16 的互动式沟通练习游戏。用户选择冲突场景后，AI 扮演正在生气的伴侣，用户通过选择回复选项练习更合适的沟通方式，并在结束后获得复盘反馈。

## 技术栈

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS 4
- 阿里云百炼 / DashScope
- Cloudflare Workers via OpenNext

## 本地开发

项目使用 `pnpm`。

```bash
pnpm install
pnpm dev
```

默认访问地址：

```text
http://localhost:5000
```

如果端口冲突：

```bash
PORT=5001 pnpm dev
```

## 环境变量

本地开发使用 `.env.local`，核心变量如下：

- `DASHSCOPE_API_KEY`
- `DASHSCOPE_BASE_URL`
- `DASHSCOPE_TTS_ENDPOINT`
- `AI_LLM_MODEL`
- `AI_REVIEW_MODEL`
- `AI_TTS_MODEL`
- `AI_REVIEW_TIMEOUT_MS`

Cloudflare 本地预览可使用 `.dev.vars`，参考 [`.dev.vars.example`](</Users/mac/Documents/practice哄哄模拟器/projects-2-work/.dev.vars.example>)。

## 常用命令

```bash
pnpm validate
pnpm build
pnpm cf:build
pnpm cf:preview
pnpm cf:deploy
```

## Cloudflare Workers 部署

项目已配置 OpenNext + Wrangler，默认部署到 `workers.dev` 域名。

首次部署前需要确保本机已完成 Cloudflare 登录：

```bash
pnpm wrangler login
```

然后执行：

```bash
pnpm cf:deploy
```

## 游戏接口

- `POST /api/chat`
- `POST /api/review`
- `POST /api/result-line`
- `POST /api/tts`
