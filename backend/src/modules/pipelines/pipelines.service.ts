import axios from "axios";
import { env } from "../../config/env";
import {
  AudioGenerationDto,
  ClassificationDto,
  QuestionAnsweringDto,
  SummarizationDto,
  TextGenerationDto,
  TranslationDto,
} from "./pipelines.dto";
import { PipelinesProvider } from "./pipelines.interfaces";
import {
  AudioGenerationResult,
  ClassificationResult,
  PipelineEnvelope,
  PipelineProviderName,
  QuestionAnsweringResult,
  SummarizationResult,
  TextGenerationResult,
  TranslationResult,
} from "./pipelines.types";

const positiveWords = ["amazing", "excellent", "good", "great", "love", "useful"];
const negativeWords = ["bad", "broken", "confusing", "hate", "poor", "terrible"];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function wordsFrom(text: string) {
  return text.toLowerCase().match(/[a-záéíóúñü]+/g) ?? [];
}

function summarizeLocally(text: string) {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.slice(0, 2).join(" ") || text.slice(0, 220);
}

function answerFromContext(question: string, context: string) {
  const questionWords = new Set(wordsFrom(question).filter((word) => word.length > 3));
  const sentences = context
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  let bestSentence = sentences[0] ?? context;
  let bestScore = 0;

  for (const sentence of sentences) {
    const score = wordsFrom(sentence).filter((word) => questionWords.has(word)).length;

    if (score > bestScore) {
      bestSentence = sentence;
      bestScore = score;
    }
  }

  const byMatch = bestSentence.match(/\bby\s+(.+?)(?:[.!?]|$)/i);
  const whoAnswer =
    question.trim().toLowerCase().startsWith("who") && byMatch?.[1]
      ? byMatch[1].split(/\s+and\s+/i).at(-1)?.trim() ?? byMatch[1].trim()
      : bestSentence;

  return {
    answer: whoAnswer,
    score: clamp(0.35 + bestScore * 0.18, 0.35, 0.96),
  };
}

class LocalPipelinesProvider implements PipelinesProvider {
  name: PipelineProviderName = "local";
  models = {
    questionAnswering: "local-keyword-qa",
    summarization: "local-extractive-summary",
    translation: "local-phrase-translator",
    classification: "local-lexicon-classifier",
    textGeneration: "local-template-generator",
    audioGeneration: "local-audio-placeholder",
  };

  async questionAnswering(dto: QuestionAnsweringDto): Promise<QuestionAnsweringResult> {
    return answerFromContext(dto.question, dto.context);
  }

  async summarize(dto: SummarizationDto): Promise<SummarizationResult> {
    return {
      summary: summarizeLocally(dto.text),
    };
  }

  async translate(dto: TranslationDto): Promise<TranslationResult> {
    const dictionary: Record<string, Record<string, string>> = {
      "en:es": {
        "hello world": "Hola mundo",
        "welcome to my application": "Bienvenido a mi aplicación",
      },
      "es:en": {
        "hola mundo": "Hello world",
        "bienvenido a mi aplicación": "Welcome to my application",
      },
    };
    const key = `${dto.sourceLanguage}:${dto.targetLanguage}`;
    const translation =
      dictionary[key]?.[dto.text.toLowerCase()] ??
      `[${dto.targetLanguage}] ${dto.text}`;

    return { translation };
  }

  async classify(dto: ClassificationDto): Promise<ClassificationResult> {
    const words = wordsFrom(dto.text);
    const positiveHits = words.filter((word) => positiveWords.includes(word)).length;
    const negativeHits = words.filter((word) => negativeWords.includes(word)).length;
    const label =
      positiveHits > negativeHits
        ? "POSITIVE"
        : negativeHits > positiveHits
          ? "NEGATIVE"
          : dto.classificationType === "zero-shot-classification"
            ? dto.candidateLabels?.[0]?.toUpperCase() ?? "NEUTRAL"
            : "NEUTRAL";

    return {
      label,
      score: label === "NEUTRAL" ? 0.5 : clamp(0.65 + Math.abs(positiveHits - negativeHits) * 0.1, 0.65, 0.99),
      classificationType: dto.classificationType ?? "sentiment-analysis",
    };
  }

  async generateText(dto: TextGenerationDto): Promise<TextGenerationResult> {
    const generatedText = `${dto.prompt.trim()} In simple terms, it is a reusable model workflow that accepts input, runs inference, and returns a typed result for the application.`;

    return {
      generatedText: generatedText.slice(0, (dto.maxNewTokens ?? 200) * 6),
    };
  }

  async generateAudio(dto: AudioGenerationDto): Promise<AudioGenerationResult> {
    return {
      audioUrl: null,
      format: dto.format ?? "mp3",
      message: `Audio generation is ready for provider integration. Text received: "${dto.text}".`,
    };
  }
}

class HuggingFacePipelinesProvider extends LocalPipelinesProvider {
  name: PipelineProviderName = "hugging-face";
  models = {
    questionAnswering: "deepset/roberta-base-squad2",
    summarization: "facebook/bart-large-cnn",
    translation: "Helsinki-NLP/opus-mt-en-es",
    classification: "distilbert-base-uncased-finetuned-sst-2-english",
    textGeneration: "gpt2",
    audioGeneration: "espnet/kan-bayashi_ljspeech_vits",
  };

  private async callModel<T>(model: string, inputs: unknown) {
    if (!env.HF_API_KEY) {
      throw new Error("HF_API_KEY is required when PIPELINES_PROVIDER=hugging-face");
    }

    const response = await axios.post<T>(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs },
      {
        headers: { Authorization: `Bearer ${env.HF_API_KEY}` },
        timeout: 60000,
      },
    );

    return response.data;
  }

  async questionAnswering(dto: QuestionAnsweringDto): Promise<QuestionAnsweringResult> {
    return this.callModel<QuestionAnsweringResult>(this.models.questionAnswering, {
      question: dto.question,
      context: dto.context,
    });
  }

  async summarize(dto: SummarizationDto): Promise<SummarizationResult> {
    const data = await this.callModel<Array<{ summary_text: string }>>(
      this.models.summarization,
      dto.text,
    );

    return { summary: data[0]?.summary_text ?? "" };
  }

  async classify(dto: ClassificationDto): Promise<ClassificationResult> {
    const data = await this.callModel<Array<Array<{ label: string; score: number }>>>(
      this.models.classification,
      dto.text,
    );
    const prediction = data[0]?.[0];

    return {
      label: prediction?.label ?? "UNKNOWN",
      score: prediction?.score ?? 0,
      classificationType: dto.classificationType ?? "sentiment-analysis",
    };
  }

  async generateText(dto: TextGenerationDto): Promise<TextGenerationResult> {
    const data = await this.callModel<Array<{ generated_text: string }>>(
      this.models.textGeneration,
      dto.prompt,
    );

    return { generatedText: data[0]?.generated_text ?? "" };
  }
}

function createProvider(): PipelinesProvider {
  const provider = process.env.PIPELINES_PROVIDER as PipelineProviderName | undefined;

  if (provider === "hugging-face") {
    return new HuggingFacePipelinesProvider();
  }

  // OpenAI, Ollama, and Transformers.js can plug into this factory without changing controllers.
  return new LocalPipelinesProvider();
}

async function withMetadata<T>(
  modelKey: keyof PipelinesProvider["models"],
  run: (provider: PipelinesProvider) => Promise<T>,
): Promise<PipelineEnvelope<T>> {
  const provider = createProvider();
  const startedAt = Date.now();
  const result = await run(provider);

  return {
    ...result,
    meta: {
      provider: provider.name,
      model: provider.models[modelKey],
      durationMs: Date.now() - startedAt,
    },
  };
}

export function questionAnswering(dto: QuestionAnsweringDto) {
  return withMetadata("questionAnswering", (provider) =>
    provider.questionAnswering(dto),
  );
}

export function summarize(dto: SummarizationDto) {
  return withMetadata("summarization", (provider) => provider.summarize(dto));
}

export function translate(dto: TranslationDto) {
  return withMetadata("translation", (provider) => provider.translate(dto));
}

export function classify(dto: ClassificationDto) {
  return withMetadata("classification", (provider) => provider.classify(dto));
}

export function generateText(dto: TextGenerationDto) {
  return withMetadata("textGeneration", (provider) => provider.generateText(dto));
}

export function generateAudio(dto: AudioGenerationDto) {
  return withMetadata("audioGeneration", (provider) => provider.generateAudio(dto));
}
