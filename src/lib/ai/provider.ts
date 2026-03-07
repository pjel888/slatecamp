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

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "openai";
  if (provider === "anthropic") {
    return new AnthropicProvider();
  }
  return new OpenAIProvider();
}

class OpenAIProvider implements AIProvider {
  private baseUrl = "https://api.openai.com/v1";
  private get headers() {
    return {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
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
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          ...(options?.systemPrompt
            ? [{ role: "system" as const, content: options.systemPrompt }]
            : []),
          { role: "user" as const, content: prompt },
        ],
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
      }),
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const res = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text,
      }),
    });
    const data = await res.json();
    return data.data[0].embedding;
  }

  async *streamCompletion(
    prompt: string,
    options?: CompletionOptions
  ): AsyncIterable<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          ...(options?.systemPrompt
            ? [{ role: "system" as const, content: options.systemPrompt }]
            : []),
          { role: "user" as const, content: prompt },
        ],
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
    });

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
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const json = JSON.parse(line.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // skip malformed JSON
          }
        }
      }
    }
  }
}

class AnthropicProvider implements AIProvider {
  private baseUrl = "https://api.anthropic.com/v1";
  private get headers() {
    return {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
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
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: options?.maxTokens ?? 2048,
        system: options?.systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content[0].text;
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    // Anthropic doesn't have embeddings — fall back to OpenAI
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
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: options?.maxTokens ?? 2048,
        system: options?.systemPrompt,
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }),
    });

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
            // skip
          }
        }
      }
    }
  }
}
