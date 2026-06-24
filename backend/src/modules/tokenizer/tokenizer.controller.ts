import { Request, Response } from "express";
import {
  analyzeText,
  listTokenizerModels,
  tokenizeText,
} from "./tokenizer.service";
import {
  TokenizerValidationError,
  validateAnalyzeTokenizerInput,
  validateTokenizeInput,
} from "./tokenizer.validators";

export function tokenizeController(req: Request, res: Response) {
  try {
    const input = validateTokenizeInput(req.body);
    return res.status(200).json(tokenizeText(input));
  } catch (error) {
    if (error instanceof TokenizerValidationError) {
      return res.status(400).json({
        message: "Invalid tokenizer request",
        error: error.message,
      });
    }

    console.error("Tokenizer error:", error);
    return res.status(500).json({
      message: "Failed to tokenize text",
      error: "An unexpected error occurred",
    });
  }
}

export function analyzeTokenizerController(req: Request, res: Response) {
  try {
    const input = validateAnalyzeTokenizerInput(req.body);
    return res.status(200).json(analyzeText(input));
  } catch (error) {
    if (error instanceof TokenizerValidationError) {
      return res.status(400).json({
        message: "Invalid tokenizer analysis request",
        error: error.message,
      });
    }

    console.error("Tokenizer analysis error:", error);
    return res.status(500).json({
      message: "Failed to analyze text",
      error: "An unexpected error occurred",
    });
  }
}

export function listTokenizerModelsController(_req: Request, res: Response) {
  return res.status(200).json({
    models: listTokenizerModels(),
  });
}
