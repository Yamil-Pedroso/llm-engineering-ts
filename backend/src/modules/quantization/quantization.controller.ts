import { Request, Response } from "express";
import { analyzeQuantization } from "./quantization.service";
import {
  QuantizationValidationError,
  validateQuantizationInput,
} from "./quantization.validators";

export function analyzeQuantizationController(req: Request, res: Response) {
  try {
    const input = validateQuantizationInput(req.body);
    return res.status(200).json(analyzeQuantization(input));
  } catch (error) {
    if (error instanceof QuantizationValidationError) {
      return res.status(400).json({
        message: "Invalid quantization request",
        error: error.message,
      });
    }

    console.error("Quantization analysis error:", error);
    return res.status(500).json({
      message: "Failed to analyze quantization",
      error: "An unexpected error occurred",
    });
  }
}
