import { Request, Response } from "express";
import {
  classify,
  generateAudio,
  generateText,
  questionAnswering,
  summarize,
  translate,
} from "./pipelines.service";
import {
  validateAudioGenerationDto,
  validateClassificationDto,
  validateQuestionAnsweringDto,
  validateSummarizationDto,
  validateTextGenerationDto,
  validateTranslationDto,
} from "./pipelines.validators";

function sendPipelineError(res: Response, error: unknown, message: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const isValidationError =
    errorMessage.includes("required") ||
    errorMessage.includes("must be") ||
    errorMessage.includes("Request body");

  return res.status(isValidationError ? 400 : 500).json({
    message,
    error: errorMessage,
  });
}

export async function questionAnsweringController(req: Request, res: Response) {
  try {
    const dto = validateQuestionAnsweringDto(req.body);
    return res.json(await questionAnswering(dto));
  } catch (error) {
    console.error("Question answering pipeline error:", error);
    return sendPipelineError(res, error, "Failed to run question answering pipeline");
  }
}

export async function summarizationController(req: Request, res: Response) {
  try {
    const dto = validateSummarizationDto(req.body);
    return res.json(await summarize(dto));
  } catch (error) {
    console.error("Summarization pipeline error:", error);
    return sendPipelineError(res, error, "Failed to run summarization pipeline");
  }
}

export async function translationController(req: Request, res: Response) {
  try {
    const dto = validateTranslationDto(req.body);
    return res.json(await translate(dto));
  } catch (error) {
    console.error("Translation pipeline error:", error);
    return sendPipelineError(res, error, "Failed to run translation pipeline");
  }
}

export async function classificationController(req: Request, res: Response) {
  try {
    const dto = validateClassificationDto(req.body);
    return res.json(await classify(dto));
  } catch (error) {
    console.error("Classification pipeline error:", error);
    return sendPipelineError(res, error, "Failed to run classification pipeline");
  }
}

export async function textGenerationController(req: Request, res: Response) {
  try {
    const dto = validateTextGenerationDto(req.body);
    return res.json(await generateText(dto));
  } catch (error) {
    console.error("Text generation pipeline error:", error);
    return sendPipelineError(res, error, "Failed to run text generation pipeline");
  }
}

export async function audioGenerationController(req: Request, res: Response) {
  try {
    const dto = validateAudioGenerationDto(req.body);
    return res.json(await generateAudio(dto));
  } catch (error) {
    console.error("Audio generation pipeline error:", error);
    return sendPipelineError(res, error, "Failed to run audio generation pipeline");
  }
}
