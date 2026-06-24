import {
  AudioGenerationDto,
  ClassificationDto,
  QuestionAnsweringDto,
  SummarizationDto,
  TextGenerationDto,
  TranslationDto,
} from "./pipelines.dto";
import {
  AudioGenerationResult,
  ClassificationResult,
  PipelineProviderName,
  QuestionAnsweringResult,
  SummarizationResult,
  TextGenerationResult,
  TranslationResult,
} from "./pipelines.types";

export type PipelineModelMap = {
  questionAnswering: string;
  summarization: string;
  translation: string;
  classification: string;
  textGeneration: string;
  audioGeneration: string;
};

export interface PipelinesProvider {
  name: PipelineProviderName;
  models: PipelineModelMap;
  questionAnswering(dto: QuestionAnsweringDto): Promise<QuestionAnsweringResult>;
  summarize(dto: SummarizationDto): Promise<SummarizationResult>;
  translate(dto: TranslationDto): Promise<TranslationResult>;
  classify(dto: ClassificationDto): Promise<ClassificationResult>;
  generateText(dto: TextGenerationDto): Promise<TextGenerationResult>;
  generateAudio(dto: AudioGenerationDto): Promise<AudioGenerationResult>;
}
