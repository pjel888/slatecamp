/// <reference types="bun-types" />
import { afterEach, describe, expect, mock, test } from 'bun:test'

import { getAIProvider } from './provider'

const ORIGINAL_ENV = { ...process.env }
const originalFetch = globalThis.fetch

const resetEnv = () => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) {
      delete process.env[key]
    }
  }

  Object.assign(process.env, ORIGINAL_ENV)
}

afterEach(() => {
  resetEnv()
  globalThis.fetch = originalFetch
})

describe('OpenRouterProvider', () => {
  test('generates chat completions through the OpenRouter chat endpoint', async () => {
    process.env.AI_PROVIDER = 'openrouter'
    process.env.OPENROUTER_API_KEY = 'x'
    process.env.OPENROUTER_CHAT_MODEL = 'anthropic/claude-sonnet-4.5'
    process.env.OPENROUTER_HTTP_REFERER = 'https://slatecamp.com'
    process.env.OPENROUTER_APP_TITLE = 'SlateCamp Test'

    const fetchMock = mock(async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'OpenRouter answer' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const ai = getAIProvider()
    const result = await ai.generateCompletion('Explain BP 344 ramps', {
      systemPrompt: 'Use verified code references.',
      maxTokens: 300,
      temperature: 0.2,
    })

    expect(result).toBe('OpenRouter answer')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://openrouter.ai/api/v1/chat/completions')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer x',
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://slatecamp.com',
      'X-OpenRouter-Title': 'SlateCamp Test',
    })

    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({
      model: 'anthropic/claude-sonnet-4.5',
      max_tokens: 300,
      temperature: 0.2,
    })
    expect(body.messages).toEqual([
      { role: 'system', content: 'Use verified code references.' },
      { role: 'user', content: 'Explain BP 344 ramps' },
    ])
  })

  test('generates embeddings through the OpenRouter embeddings endpoint', async () => {
    process.env.AI_PROVIDER = 'openrouter'
    process.env.OPENROUTER_API_KEY = 'x'
    process.env.OPENROUTER_EMBEDDING_MODEL = 'openai/text-embedding-3-small'

    const fetchMock = mock(async () =>
      new Response(
        JSON.stringify({
          data: [{ embedding: [0.1, 0.2, 0.3] }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const ai = getAIProvider()
    const result = await ai.generateEmbedding('PD 1096 occupancy classification')

    expect(result).toEqual([0.1, 0.2, 0.3])
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://openrouter.ai/api/v1/embeddings')

    const body = JSON.parse(init.body as string)
    expect(body).toEqual({
      model: 'openai/text-embedding-3-small',
      input: 'PD 1096 occupancy classification',
    })
  })

  test('streams chat completion chunks through OpenRouter SSE', async () => {
    process.env.AI_PROVIDER = 'openrouter'
    process.env.OPENROUTER_API_KEY = 'x'
    process.env.OPENROUTER_CHAT_MODEL = 'openai/gpt-4o'

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder()
        controller.enqueue(encoder.encode(': keep-alive\n\n'))
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'))
        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":" world"}}]}\n\n'))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    const fetchMock = mock(async () =>
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      })
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const chunks: string[] = []
    for await (const chunk of getAIProvider().streamCompletion('Say hello')) {
      chunks.push(chunk)
    }

    expect(chunks).toEqual(['Hello', ' world'])
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body.stream).toBe(true)
    expect(body.model).toBe('openai/gpt-4o')
  })

  test('fails fast when OpenRouter API key is missing', async () => {
    process.env.AI_PROVIDER = 'openrouter'
    delete process.env.OPENROUTER_API_KEY

    const fetchMock = mock(async () => new Response('{}', { status: 200 }))
    globalThis.fetch = fetchMock as unknown as typeof fetch

    await expect(getAIProvider().generateCompletion('Will not send')).rejects.toThrow(
      'OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter'
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('legacy provider fallback modes', () => {
  test('keeps direct OpenAI fallback compatible without the OpenAI SDK', async () => {
    process.env.AI_PROVIDER = 'openai'
    process.env.OPENAI_API_KEY = 'x'
    process.env.OPENAI_CHAT_MODEL = 'gpt-4o-mini'
    process.env.OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small'

    const fetchMock = mock(async (url: string) => {
      if (url.endsWith('/embeddings')) {
        return new Response(
          JSON.stringify({ data: [{ embedding: [0.4, 0.5, 0.6] }] }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'Legacy OpenAI answer' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    })
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const ai = getAIProvider()
    await expect(ai.generateCompletion('Explain RA 9514')).resolves.toBe('Legacy OpenAI answer')
    await expect(ai.generateEmbedding('RA 9514')).resolves.toEqual([0.4, 0.5, 0.6])

    const [chatUrl, chatInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(chatUrl).toBe('https://api.openai.com/v1/chat/completions')
    expect(chatInit.headers).toMatchObject({ Authorization: 'Bearer x' })
    expect(JSON.parse(chatInit.body as string).model).toBe('gpt-4o-mini')

    const [embeddingUrl, embeddingInit] = fetchMock.mock.calls[1] as unknown as [string, RequestInit]
    expect(embeddingUrl).toBe('https://api.openai.com/v1/embeddings')
    expect(JSON.parse(embeddingInit.body as string).model).toBe('text-embedding-3-small')
  })

  test('keeps direct Anthropic fallback compatible for chat completions', async () => {
    process.env.AI_PROVIDER = 'anthropic'
    process.env.ANTHROPIC_API_KEY = 'x'
    process.env.ANTHROPIC_CHAT_MODEL = 'claude-sonnet-4-20250514'

    const fetchMock = mock(async () =>
      new Response(
        JSON.stringify({ content: [{ text: 'Legacy Anthropic answer' }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    )
    globalThis.fetch = fetchMock as unknown as typeof fetch

    const result = await getAIProvider().generateCompletion('Explain NBC occupancy', {
      systemPrompt: 'Use only verified rules.',
      maxTokens: 100,
    })

    expect(result).toBe('Legacy Anthropic answer')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers).toMatchObject({
      'x-api-key': 'x',
      'anthropic-version': '2023-06-01',
    })
    expect(JSON.parse(init.body as string)).toMatchObject({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      system: 'Use only verified rules.',
      messages: [{ role: 'user', content: 'Explain NBC occupancy' }],
    })
  })
})
