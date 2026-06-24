import {
  AudioGenerationDto,
  ClassificationDto,
  QuestionAnsweringDto,
  SummarizationDto,
  TextGenerationDto,
  TranslationDto,
} from "./pipelines.dto";
import { ClassificationType } from "./pipelines.types";

const classificationTypes: ClassificationType[] = [
  "sentiment-analysis",
  "zero-shot-classification",
  "text-classification",
];

function asBody(value: unknown) {
  if (!value || typeof value !== "object") {
    throw new Error("Request body must be an object");
  }

  return value as Record<string, unknown>;
}

function requiredString(body: Record<string, unknown>, field: string) {
  const value = body[field];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} is required`);
  }

  return value.trim();
}

function optionalNumber(
  body: Record<string, unknown>,
  field: string,
  min: number,
  max: number,
) {
  const value = body[field];

  if (value === undefined) {
    return undefined;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < min || numberValue > max) {
    throw new Error(`${field} must be between ${min} and ${max}`);
  }

  return numberValue;
}

export function validateQuestionAnsweringDto(body: unknown): QuestionAnsweringDto {
  const data = asBody(body);

  return {
    question: requiredString(data, "question"),
    context: requiredString(data, "context"),
  };
}

export function validateSummarizationDto(body: unknown): SummarizationDto {
  const data = asBody(body);

  return {
    text: requiredString(data, "text"),
  };
}

export function validateTranslationDto(body: unknown): TranslationDto {
  const data = asBody(body);

  return {
    text: requiredString(data, "text"),
    sourceLanguage: requiredString(data, "sourceLanguage"),
    targetLanguage: requiredString(data, "targetLanguage"),
  };
}

export function validateClassificationDto(body: unknown): ClassificationDto {
  const data = asBody(body);
  const classificationType = data.classificationType ?? "sentiment-analysis";

  if (
    typeof classificationType !== "string" ||
    !classificationTypes.includes(classificationType as ClassificationType)
  ) {
    throw new Error(
      `classificationType must be one of: ${classificationTypes.join(", ")}`,
    );
  }

  const candidateLabels = Array.isArray(data.candidateLabels)
    ? data.candidateLabels.filter(
        (label): label is string => typeof label === "string" && !!label.trim(),
      )
    : undefined;

  return {
    text: requiredString(data, "text"),
    classificationType: classificationType as ClassificationType,
    candidateLabels,
  };
}

export function validateTextGenerationDto(body: unknown): TextGenerationDto {
  const data = asBody(body);

  return {
    prompt: requiredString(data, "prompt"),
    temperature: optionalNumber(data, "temperature", 0, 2),
    maxNewTokens: optionalNumber(data, "maxNewTokens", 1, 2000),
    topP: optionalNumber(data, "topP", 0, 1),
  };
}

export function validateAudioGenerationDto(body: unknown): AudioGenerationDto {
  const data = asBody(body);
  const format = data.format ?? "mp3";

  if (format !== "mp3" && format !== "wav") {
    throw new Error("format must be mp3 or wav");
  }

  return {
    text: requiredString(data, "text"),
    voice: typeof data.voice === "string" ? data.voice.trim() : undefined,
    format,
  };
}
