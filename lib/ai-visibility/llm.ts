import {
  generateText as sharedGenerateText,
  generateJson as sharedGenerateJson,
  type ChatMessage,
} from "../services/llm"

export type { ChatMessage }

export async function generateText(
  messages: ChatMessage[],
  temperature = 0.1
): Promise<string> {
  return sharedGenerateText(messages, { temperature })
}

export async function generateJson<T>(messages: ChatMessage[]): Promise<T> {
  return sharedGenerateJson<T>(messages)
}
