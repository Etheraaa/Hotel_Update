import type { PhrasingModelClient } from "../types/phrasing.js";

function readResponseText(data: any) {
  if (typeof data?.output_text === "string" && data.output_text.trim().length > 0) {
    return data.output_text.trim();
  }

  const chatMessage = data?.choices?.[0]?.message?.content;

  if (typeof chatMessage === "string" && chatMessage.trim().length > 0) {
    return chatMessage.trim();
  }

  const messageText = data?.output?.[0]?.content
    ?.map((item: { type?: string; text?: string }) => item?.text ?? "")
    .join("")
    .trim();

  return typeof messageText === "string" && messageText.length > 0 ? messageText : "";
}

export class ConfigurationError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class UpstreamGenerationError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "UpstreamGenerationError";
  }
}

function shouldUseChatCompletions(baseUrl: string) {
  if (process.env.OPENAI_API_MODE === "chat") return true;
  if (process.env.OPENAI_API_MODE === "responses") return false;

  return !baseUrl.includes("api.openai.com");
}

export function createOpenAIResponsesClient(): PhrasingModelClient {
  return {
    async generateText(prompt: string) {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new ConfigurationError("OPENAI_API_KEY is missing");
      }

      const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(
        /\/$/,
        ""
      );
      const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
      const useChatCompletions = shouldUseChatCompletions(baseUrl);
      const response = await fetch(`${baseUrl}${useChatCompletions ? "/chat/completions" : "/responses"}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          useChatCompletions
            ? {
                model,
                messages: [
                  {
                    role: "system",
                    content: prompt
                  }
                ],
                max_tokens: 220
              }
            : {
                model,
                input: [
                  {
                    role: "developer",
                    content: prompt
                  }
                ],
                max_output_tokens: 220
              }
        )
      });

      if (!response.ok) {
        throw new UpstreamGenerationError(`OpenAI request failed with status ${response.status}`);
      }

      const data = (await response.json()) as unknown;
      const text = readResponseText(data);

      if (!text) {
        throw new UpstreamGenerationError("Empty model response");
      }

      return text;
    }
  };
}
