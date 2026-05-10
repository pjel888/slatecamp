export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface QuestionGenConfig {
  profession: string;
  examTarget: string;
  difficulty: string;
  count: number;
}

export interface AIProvider {
  generateCompletion(
    prompt: string,
    options?: CompletionOptions
  ): Promise<string>;
  generateEmbedding(text: string): Promise<number[]>;
  streamCompletion(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<string>;
}

const AI_COMPLETION_TIMEOUT_MS = Number(process.env.AI_COMPLETION_TIMEOUT_MS ?? 30_000);
const AI_EMBEDDING_TIMEOUT_MS = Number(process.env.AI_EMBEDDING_TIMEOUT_MS ?? 10_000);
const AI_STREAM_TIMEOUT_MS = Number(process.env.AI_STREAM_TIMEOUT_MS ?? 60_000);

const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_CHAT_MODEL = "openai/gpt-4o";
const DEFAULT_OPENROUTER_EMBEDDING_MODEL = "openai/text-embedding-3-small";
const DEFAULT_OPENAI_CHAT_MODEL = "gpt-4o";
const DEFAULT_OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_ANTHROPIC_CHAT_MODEL = "claude-sonnet-4-20250514";

const timeoutSignal = (timeoutMs: number): AbortSignal => {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  if (typeof timeout === "object" && "unref" in timeout) {
    timeout.unref();
  }
  return controller.signal;
};

const requiredEnv = (name: string, context: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required when ${context}`);
  }
  return value;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const optionalHeader = (
  headers: Record<string, string>,
  name: string,
  value?: string
): void => {
  const normalizedValue = value?.trim();
  if (normalizedValue) {
    headers[name] = normalizedValue;
  }
};

const completionMessages = (prompt: string, options?: CompletionOptions) => [
  ...(options?.systemPrompt
    ? [{ role: "system" as const, content: options.systemPrompt }]
    : []),
  { role: "user" as const, content: prompt },
];

const readJsonResponse = async (res: Response, provider: string) => {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const excerpt = body.slice(0, 300);
    throw new Error(`${provider} request failed with ${res.status}${excerpt ? `: ${excerpt}` : ""}`);
  }

  return res.json();
};

const readChatContent = (data: any, provider: string): string => {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content;
  }

  throw new Error(`${provider} response did not include message content`);
};

async function* readOpenAICompatibleStream(
  res: Response,
  provider: string
): AsyncIterable<string> {
  if (!res.ok) {
    await readJsonResponse(res, provider);
  }

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line || line.startsWith(":")) {
        continue;
      }
      if (!line.startsWith("data: ")) {
        continue;
      }

      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") {
        continue;
      }

      try {
        const json = JSON.parse(payload);
        const content = json.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip malformed JSON chunks
      }
    }
  }
}

export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  if (provider === "openrouter") {
    return new OpenRouterProvider();
  }
  if (provider === "anthropic") {
    return new AnthropicProvider();
  }
  if (provider === "openai") {
    return new OpenAIProvider();
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider}`);
}

class OpenRouterProvider implements AIProvider {
  private baseUrl = trimTrailingSlash(
    process.env.OPENROUTER_BASE_URL ?? DEFAULT_OPENROUTER_BASE_URL
  );

  private get chatModel() {
    return process.env.OPENROUTER_CHAT_MODEL?.trim() || DEFAULT_OPENROUTER_CHAT_MODEL;
  }

  private get embeddingModel() {
    return process.env.OPENROUTER_EMBEDDING_MODEL?.trim() || DEFAULT_OPENROUTER_EMBEDDING_MODEL;
  }

  private get headers() {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${requiredEnv("OPENROUTER_API_KEY", "AI_PROVIDER=openrouter")}`,
      "Content-Type": "application/json",
    };

    optionalHeader(
      headers,
      "HTTP-Referer",
      process.env.OPENROUTER_HTTP_REFERER ?? process.env.NEXT_PUBLIC_APP_URL
    );
    optionalHeader(headers, "X-OpenRouter-Title", process.env.OPENROUTER_APP_TITLE ?? "SlateCamp");

    return headers;
  }

  async generateCompletion(
    prompt: string,
    options?: CompletionOptions
  ): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers,
      signal: timeoutSignal(AI_COMPLETION_TIMEOUT_MS),
      body: JSON.stringify({
        model: this.chatModel,
        messages: completionMessages(prompt, options),
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
      }),
    });
    const data = await readJsonResponse(res, "OpenRouter completion");
    return readChatContent(data, "OpenRouter completion");
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: this.headers,
      signal: timeoutSignal(AI_EMBEDDING_TIMEOUT_MS),
      body: JSON.stringify({
        model: this.embeddingModel,
        input: text,
      }),
    });
    const data = await readJsonResponse(res, "OpenRouter embedding");
    return data.data[0].embedding;
  }

  async *streamCompletion(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers,
      signal: timeoutSignal(AI_STREAM_TIMEOUT_MS),
      body: JSON.stringify({
        model: this.chatModel,
        messages: completionMessages(prompt, options),
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
    });

    yield* readOpenAICompatibleStream(res, "OpenRouter stream");
  }
}

class OpenAIProvider implements AIProvider {
  private baseUrl = "https://api.openai.com/v1";
  private get headers() {
    return {
      Authorization: `Bearer ${requiredEnv("OPENAI_API_KEY", "AI_PROVIDER=openai")}`,
      "Content-Type": "application/json",
    };
  }

  async generateCompletion(
    prompt: string,
    options?: CompletionOptions
  ): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers,
      signal: timeoutSignal(AI_COMPLETION_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL?.trim() || DEFAULT_OPENAI_CHAT_MODEL,
        messages: completionMessages(prompt, options),
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
      }),
    });
    const data = await readJsonResponse(res, "OpenAI completion");
    return readChatContent(data, "OpenAI completion");
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: this.headers,
      signal: timeoutSignal(AI_EMBEDDING_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.OPENAI_EMBEDDING_MODEL?.trim() || DEFAULT_OPENAI_EMBEDDING_MODEL,
        input: text,
      }),
    });
    const data = await readJsonResponse(res, "OpenAI embedding");
    return data.data[0].embedding;
  }

  async *streamCompletion(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers,
      signal: timeoutSignal(AI_STREAM_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.OPENAI_CHAT_MODEL?.trim() || DEFAULT_OPENAI_CHAT_MODEL,
        messages: completionMessages(prompt, options),
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
    });

    yield* readOpenAICompatibleStream(res, "OpenAI stream");
  }
}

class AnthropicProvider implements AIProvider {
  private baseUrl = "https://api.anthropic.com/v1";
  private get headers() {
    return {
      "x-api-key": requiredEnv("ANTHROPIC_API_KEY", "AI_PROVIDER=anthropic"),
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    };
  }

  async generateCompletion(
    prompt: string,
    options?: CompletionOptions
  ): Promise<string> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: this.headers,
      signal: timeoutSignal(AI_COMPLETION_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.ANTHROPIC_CHAT_MODEL?.trim() || DEFAULT_ANTHROPIC_CHAT_MODEL,
        max_tokens: options?.maxTokens ?? 2048,
        system: options?.systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await readJsonResponse(res, "Anthropic completion");
    return data.content[0].text;
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    // Anthropic doesn't have embeddings — fall back to OpenAI-compatible embeddings.
    const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
    if (openRouterKey) {
      const openRouter = new OpenRouterProvider();
      return openRouter.generateEmbedding(_text);
    }

    const openai = new OpenAIProvider();
    return openai.generateEmbedding(_text);
  }

  async *streamCompletion(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<string> {
    const res = await fetch(`${this.baseUrl}/messages`, {
      method: "POST",
      headers: this.headers,
      signal: timeoutSignal(AI_STREAM_TIMEOUT_MS),
      body: JSON.stringify({
        model: process.env.ANTHROPIC_CHAT_MODEL?.trim() || DEFAULT_ANTHROPIC_CHAT_MODEL,
        max_tokens: options?.maxTokens ?? 2048,
        system: options?.systemPrompt,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

    if (!res.ok) {
      await readJsonResponse(res, "Anthropic stream");
    }

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.type === "content_block_delta") {
              yield json.delta.text;
            }
          } catch {
            // skip malformed JSON chunks
          }
        }
      }
    }
  }
}
