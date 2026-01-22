// DeepSeek API 客户端配置

import OpenAI from 'openai';

// 扩展类型以支持 DeepSeek 特定参数
interface DeepSeekCompletionParams extends OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
  enable_thinking?: boolean;
}

interface DeepSeekCompletionParamsStreaming extends OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming {
  enable_thinking?: boolean;
}

// 懒加载客户端 - 只在首次使用时初始化
function getClient() {
  return new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api-inference.modelscope.cn/v1',
    apiKey: process.env.DEEPSEEK_API_KEY,
  });
}

// 流式生成
export async function generateStream(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const client = getClient();
  const params: DeepSeekCompletionParamsStreaming = {
    model: process.env.DEEPSEEK_MODEL || 'deepseek-ai/DeepSeek-V3.2',
    messages,
    stream: true,
    enable_thinking: true,
  };
  const stream = await client.chat.completions.create(params as OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming);

  let fullText = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      fullText += content;
      onChunk(content);
    }
  }
  return fullText;
}

// 非流式生成
export async function generateWithoutStream(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
): Promise<string> {
  const client = getClient();
  const params: DeepSeekCompletionParams = {
    model: process.env.DEEPSEEK_MODEL || 'deepseek-ai/DeepSeek-V3.2',
    messages,
    stream: false,
    enable_thinking: true,
  };
  const response = await client.chat.completions.create(params as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming);

  return response.choices[0]?.message?.content || '';
}
