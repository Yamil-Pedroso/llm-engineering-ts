import { Request, Response } from "express";
import {
  convertToModelMessages,
  experimental_generateSpeech as generateSpeech,
  generateText,
  Output,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const model = openai("gpt-4.1-mini");
const speechModel = openai.speech("gpt-4o-mini-tts");

async function pipeWebResponseToExpress(webResponse: globalThis.Response, res: Response) {
  res.status(webResponse.status);
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!webResponse.body) {
    res.end();
    return;
  }

  const reader = webResponse.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }
  } finally {
    res.end();
  }
}

export async function chatController(req: Request, res: Response) {
  try {
    const { messages }: { messages: UIMessage[] } = req.body;

    const result = streamText({
      model,
      system:
        "You are a concise AI tutor. Explain concepts clearly and use short examples.",
      messages: await convertToModelMessages(messages),
    });

    await pipeWebResponseToExpress(result.toUIMessageStreamResponse(), res);
  } catch (error) {
    console.error("AI SDK chat error:", error);
    res.status(500).json({
      message: "Failed to stream AI SDK chat response",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function structuredBriefController(req: Request, res: Response) {
  try {
    const topic = typeof req.body.topic === "string" ? req.body.topic : "";

    if (!topic.trim()) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const { output, usage } = await generateText({
      model,
      output: Output.object({
        schema: z.object({
          title: z.string(),
          summary: z.string(),
          audience: z.string(),
          keyPoints: z.array(z.string()).min(3).max(5),
          nextExperiment: z.string(),
        }),
      }),
      prompt: `Create a compact learning brief for this AI engineering topic: ${topic}`,
    });

    return res.json({
      brief: output,
      metrics: {
        model: "gpt-4.1-mini",
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      },
    });
  } catch (error) {
    console.error("AI SDK structured brief error:", error);
    return res.status(500).json({
      message: "Failed to generate structured brief",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function toolChatController(req: Request, res: Response) {
  try {
    const { messages }: { messages: UIMessage[] } = req.body;

    const result = streamText({
      model,
      system:
        "You are a travel planning assistant. When weather would help, call the getWeather tool before answering.",
      messages: await convertToModelMessages(messages),
      tools: {
        getWeather: tool({
          description: "Get a lightweight weather estimate for a city.",
          inputSchema: z.object({
            city: z.string().describe("The city to estimate weather for"),
          }),
          execute: async ({ city }) => {
            const seed = city
              .toLowerCase()
              .split("")
              .reduce((total, char) => total + char.charCodeAt(0), 0);

            const conditions = ["sunny", "cloudy", "rainy", "windy"];
            return {
              city,
              condition: conditions[seed % conditions.length],
              temperatureC: 12 + (seed % 19),
            };
          },
        }),
      },
    });

    await pipeWebResponseToExpress(result.toUIMessageStreamResponse(), res);
  } catch (error) {
    console.error("AI SDK tool chat error:", error);
    res.status(500).json({
      message: "Failed to stream AI SDK tool chat response",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function speechController(req: Request, res: Response) {
  try {
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    const voice = typeof req.body.voice === "string" ? req.body.voice : "alloy";
    const instructions =
      typeof req.body.instructions === "string"
        ? req.body.instructions.trim()
        : undefined;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const result = await generateSpeech({
      model: speechModel,
      text,
      voice,
      outputFormat: "mp3",
      instructions,
    });

    return res.json({
      audio: result.audio.base64,
      mediaType: result.audio.mediaType,
      format: result.audio.format,
      metrics: {
        model: "gpt-4o-mini-tts",
        voice,
      },
    });
  } catch (error) {
    console.error("AI SDK speech error:", error);
    return res.status(500).json({
      message: "Failed to generate AI SDK speech",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
