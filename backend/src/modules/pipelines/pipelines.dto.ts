import { ClassificationType } from "./pipelines.types";

export type QuestionAnsweringDto = {
  question: string;
  context: string;
};

export type SummarizationDto = {
  text: string;
};

export type TranslationDto = {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
};

export type ClassificationDto = {
  text: string;
  classificationType?: ClassificationType;
  candidateLabels?: string[];
};

export type TextGenerationDto = {
  prompt: string;
  temperature?: number;
  maxNewTokens?: number;
  topP?: number;
};

export type AudioGenerationDto = {
  text: string;
  voice?: string;
  format?: "mp3" | "wav";
};
