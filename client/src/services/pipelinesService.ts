import apiClient from "../api/apiClient";

export type PipelineMeta = {
  provider: string;
  model: string;
  durationMs: number;
};

export type ClassificationType =
  | "sentiment-analysis"
  | "zero-shot-classification"
  | "text-classification";

export type QuestionAnsweringResponse = {
  answer: string;
  score?: number;
  meta: PipelineMeta;
};

export type SummarizationResponse = {
  summary: string;
  meta: PipelineMeta;
};

export type TranslationResponse = {
  translation: string;
  meta: PipelineMeta;
};

export type ClassificationResponse = {
  label: string;
  score: number;
  classificationType: ClassificationType;
  meta: PipelineMeta;
};

export type TextGenerationResponse = {
  generatedText: string;
  meta: PipelineMeta;
};

export type AudioGenerationResponse = {
  audioUrl: string | null;
  format: string;
  message: string;
  meta: PipelineMeta;
};

export type PipelineResponse =
  | QuestionAnsweringResponse
  | SummarizationResponse
  | TranslationResponse
  | ClassificationResponse
  | TextGenerationResponse
  | AudioGenerationResponse;

export async function questionAnswering(payload: {
  question: string;
  context: string;
}) {
  const response = await apiClient.post<QuestionAnsweringResponse>(
    "/pipelines/question-answering",
    payload,
  );
  return response.data;
}

export async function summarize(payload: { text: string }) {
  const response = await apiClient.post<SummarizationResponse>(
    "/pipelines/summarize",
    payload,
  );
  return response.data;
}

export async function translate(payload: {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}) {
  const response = await apiClient.post<TranslationResponse>(
    "/pipelines/translate",
    payload,
  );
  return response.data;
}

export async function classify(payload: {
  text: string;
  classificationType: ClassificationType;
  candidateLabels?: string[];
}) {
  const response = await apiClient.post<ClassificationResponse>(
    "/pipelines/classify",
    payload,
  );
  return response.data;
}

export async function generateText(payload: {
  prompt: string;
  temperature: number;
  maxNewTokens: number;
  topP: number;
}) {
  const response = await apiClient.post<TextGenerationResponse>(
    "/pipelines/generate",
    payload,
  );
  return response.data;
}

export async function generateAudio(payload: {
  text: string;
  voice?: string;
  format: "mp3" | "wav";
}) {
  const response = await apiClient.post<AudioGenerationResponse>(
    "/pipelines/audio-generation",
    payload,
  );
  return response.data;
}
