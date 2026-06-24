export type PipelineProviderName =
  | "local"
  | "hugging-face"
  | "transformers-js"
  | "openai"
  | "ollama";

export type ClassificationType =
  | "sentiment-analysis"
  | "zero-shot-classification"
  | "text-classification";

export type PipelineMetadata = {
  provider: PipelineProviderName;
  model: string;
  durationMs: number;
};

export type PipelineEnvelope<T> = T & {
  meta: PipelineMetadata;
};

export type QuestionAnsweringResult = {
  answer: string;
  score?: number;
};

export type SummarizationResult = {
  summary: string;
};

export type TranslationResult = {
  translation: string;
};

export type ClassificationResult = {
  label: string;
  score: number;
  classificationType: ClassificationType;
};

export type TextGenerationResult = {
  generatedText: string;
};

export type AudioGenerationResult = {
  audioUrl: string | null;
  format: string;
  message: string;
};
