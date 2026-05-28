import { Buffer } from 'node:buffer';

type AiServiceName = 'chat' | 'review' | 'result-line' | 'tts';

type AuthHeaderMode = {
  headerName: string;
  prefix: string;
};

type RequestOptions = {
  endpoint?: string;
  apiKey?: string;
  payload: unknown;
  timeoutMs?: number;
  auth?: AuthHeaderMode;
};

function readEnv(...keys: string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function getServiceEndpoint(service: AiServiceName) {
  switch (service) {
    case 'chat':
      return (
        readEnv('AI_CHAT_ENDPOINT', 'AI_LLM_ENDPOINT') ??
        `${readEnv('AI_LLM_BASE_URL', 'DASHSCOPE_BASE_URL') ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/chat/completions`
      );
    case 'review':
      return (
        readEnv('AI_REVIEW_ENDPOINT', 'AI_LLM_ENDPOINT') ??
        `${readEnv('AI_LLM_BASE_URL', 'DASHSCOPE_BASE_URL') ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/chat/completions`
      );
    case 'result-line':
      return (
        readEnv('AI_RESULT_LINE_ENDPOINT', 'AI_LLM_ENDPOINT') ??
        `${readEnv('AI_LLM_BASE_URL', 'DASHSCOPE_BASE_URL') ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/chat/completions`
      );
    case 'tts':
      return (
        readEnv('AI_TTS_ENDPOINT', 'DASHSCOPE_TTS_ENDPOINT') ??
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
      );
  }
}

function getServiceModel(service: AiServiceName) {
  switch (service) {
    case 'chat':
      return readEnv('AI_CHAT_MODEL', 'AI_LLM_MODEL');
    case 'review':
      return readEnv('AI_REVIEW_MODEL', 'AI_LLM_MODEL');
    case 'result-line':
      return readEnv('AI_RESULT_LINE_MODEL', 'AI_LLM_MODEL');
    case 'tts':
      return readEnv('AI_TTS_MODEL');
  }
}

function getServiceApiKey(service: AiServiceName) {
  switch (service) {
    case 'chat':
      return readEnv('AI_CHAT_API_KEY', 'AI_API_KEY', 'DASHSCOPE_API_KEY');
    case 'review':
      return readEnv('AI_REVIEW_API_KEY', 'AI_API_KEY', 'DASHSCOPE_API_KEY');
    case 'result-line':
      return readEnv('AI_RESULT_LINE_API_KEY', 'AI_API_KEY', 'DASHSCOPE_API_KEY');
    case 'tts':
      return readEnv('AI_TTS_API_KEY', 'AI_API_KEY', 'DASHSCOPE_API_KEY');
  }
}

function getServiceTimeoutMs(service: AiServiceName) {
  switch (service) {
    case 'chat':
      return readEnv('AI_CHAT_TIMEOUT_MS', 'AI_REQUEST_TIMEOUT_MS');
    case 'review':
      return readEnv('AI_REVIEW_TIMEOUT_MS', 'AI_REQUEST_TIMEOUT_MS');
    case 'result-line':
      return readEnv('AI_RESULT_LINE_TIMEOUT_MS', 'AI_REQUEST_TIMEOUT_MS');
    case 'tts':
      return readEnv('AI_TTS_TIMEOUT_MS', 'AI_REQUEST_TIMEOUT_MS');
  }
}

function getAuthHeader() {
  return {
    headerName: readEnv('AI_API_KEY_HEADER') ?? 'Authorization',
    prefix: readEnv('AI_API_KEY_PREFIX') ?? 'Bearer ',
  };
}

function buildRequestHeaders(apiKey?: string, auth?: AuthHeaderMode) {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (apiKey) {
    const headerName = auth?.headerName ?? 'Authorization';
    const prefix = auth?.prefix ?? 'Bearer ';
    headers.set(headerName, `${prefix}${apiKey}`);
  }

  return headers;
}

async function parseJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  if (contentType.startsWith('audio/')) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    return {
      audioBase64: Buffer.from(bytes).toString('base64'),
      audioMimeType: contentType.split(';')[0] || 'audio/mpeg',
      audioSize: bytes.length,
    };
  }

  return response.text();
}

export async function callAiService(
  service: AiServiceName,
  payload: unknown,
  overrides?: Partial<RequestOptions>,
) {
  const endpoint = overrides?.endpoint ?? getServiceEndpoint(service);
  if (!endpoint) {
    return null;
  }

  const apiKey = overrides?.apiKey ?? getServiceApiKey(service);
  const timeoutMs = overrides?.timeoutMs ?? Number(getServiceTimeoutMs(service) ?? '60000');
  const auth = overrides?.auth ?? getAuthHeader();
  const headers = buildRequestHeaders(apiKey, auth);

  const controller = new AbortController();
  const timeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 60000;
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await parseJsonResponse(response);
    if (!response.ok) {
      const message =
        typeof data === 'string'
          ? data
          : (data as { error?: string; message?: string })?.error ??
            (data as { error?: string; message?: string })?.message ??
            `HTTP ${response.status}`;
      throw new Error(message);
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

export function resolveConfiguredModel(service: AiServiceName, fallback: string) {
  return getServiceModel(service) ?? fallback;
}

export function extractTextFromAiResponse(data: unknown) {
  if (typeof data === 'string') {
    return data;
  }

  if (!data || typeof data !== 'object') {
    return '';
  }

  const record = data as Record<string, unknown>;
  const choices = record.choices as Array<Record<string, unknown>> | undefined;

  if (typeof record.content === 'string') {
    return record.content;
  }

  if (typeof record.text === 'string') {
    return record.text;
  }

  if (typeof record.output_text === 'string') {
    return record.output_text;
  }

  if (typeof record.result === 'string') {
    return record.result;
  }

  if (typeof record.message === 'object' && record.message) {
    const message = record.message as Record<string, unknown>;
    if (typeof message.content === 'string') {
      return message.content;
    }
  }

  if (Array.isArray(choices) && choices.length > 0) {
    const firstChoice = choices[0];
    if (typeof firstChoice.text === 'string') {
      return firstChoice.text;
    }
    if (typeof firstChoice.message === 'object' && firstChoice.message) {
      const message = firstChoice.message as Record<string, unknown>;
      if (typeof message.content === 'string') {
        return message.content;
      }
    }
  }

  if (typeof record.data === 'object' && record.data) {
    const nested = record.data as Record<string, unknown>;
    return extractTextFromAiResponse(nested);
  }

  return '';
}

export function extractAudioFromAiResponse(data: unknown) {
  if (!data || typeof data !== 'object') {
    return {
      audioUri: null as string | null,
      audioSize: 0,
    };
  }

  const record = data as Record<string, unknown>;

  const directAudioUri =
    (typeof record.audioUri === 'string' && record.audioUri) ||
    (typeof record.audio_url === 'string' && record.audio_url) ||
    (typeof record.url === 'string' && record.url) ||
    (typeof record.audio === 'string' && record.audio) ||
    null;

  if (directAudioUri) {
    return {
      audioUri: directAudioUri,
      audioSize:
        typeof record.audioSize === 'number'
          ? record.audioSize
          : typeof record.size === 'number'
            ? record.size
            : 0,
    };
  }

  if (typeof record.audioBase64 === 'string' && record.audioBase64) {
    const mimeType =
      typeof record.audioMimeType === 'string' && record.audioMimeType
        ? record.audioMimeType
        : 'audio/mpeg';
    return {
      audioUri: `data:${mimeType};base64,${record.audioBase64}`,
      audioSize:
        typeof record.audioSize === 'number'
          ? record.audioSize
          : Buffer.from(record.audioBase64, 'base64').length,
    };
  }

  if (typeof record.data === 'object' && record.data) {
    return extractAudioFromAiResponse(record.data);
  }

  if (typeof record.output === 'object' && record.output) {
    const nested = record.output as Record<string, unknown>;
    const audio = nested.audio as Record<string, unknown> | undefined;
    if (audio) {
      const audioUri =
        (typeof audio.url === 'string' && audio.url) ||
        (typeof audio.data === 'string' && audio.data.startsWith('http') ? audio.data : null);
      if (audioUri) {
        return {
          audioUri,
          audioSize:
            typeof audio.size === 'number'
              ? audio.size
              : typeof record.audioSize === 'number'
                ? record.audioSize
                : 0,
        };
      }
      if (typeof audio.data === 'string' && audio.data) {
        return {
          audioUri: `data:audio/wav;base64,${audio.data}`,
          audioSize:
            typeof audio.size === 'number'
              ? audio.size
              : Buffer.from(audio.data, 'base64').length,
        };
      }
    }
    return extractAudioFromAiResponse(nested);
  }

  return {
    audioUri: null as string | null,
    audioSize: 0,
  };
}
