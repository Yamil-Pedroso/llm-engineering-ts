import {
  DEFAULT_TOKENIZER_MODEL_ID,
  findTokenizerModel,
} from "./config/models";
import {
  AnalyzeTokenizerInput,
  TokenizeInput,
} from "./tokenizer.types";

export class TokenizerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenizerValidationError";
  }
}

export function validateTokenizeInput(body: unknown): TokenizeInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new TokenizerValidationError("Request body must be an object");
  }

  const { text, includeSpaces } = body as Record<string, unknown>;

  if (typeof text !== "string") {
    throw new TokenizerValidationError("text must be a string");
  }

  if (!text.trim()) {
    throw new TokenizerValidationError("text cannot be empty");
  }

  if (includeSpaces !== undefined && typeof includeSpaces !== "boolean") {
    throw new TokenizerValidationError("includeSpaces must be a boolean");
  }

  return {
    text,
    includeSpaces: includeSpaces ?? false,
  };
}

export function validateAnalyzeTokenizerInput(
  body: unknown,
): AnalyzeTokenizerInput {
  const baseInput = validateTokenizeInput(body);
  const { selectedModel, estimatedOutputTokens } = body as Record<
    string,
    unknown
  >;
  const modelId =
    selectedModel === undefined ? DEFAULT_TOKENIZER_MODEL_ID : selectedModel;

  if (typeof modelId !== "string" || !findTokenizerModel(modelId)) {
    throw new TokenizerValidationError(
      "selectedModel must be a supported model ID",
    );
  }

  const outputTokens =
    estimatedOutputTokens === undefined ? 500 : estimatedOutputTokens;

  if (
    typeof outputTokens !== "number" ||
    !Number.isInteger(outputTokens) ||
    outputTokens < 0 ||
    outputTokens > 1_000_000
  ) {
    throw new TokenizerValidationError(
      "estimatedOutputTokens must be an integer between 0 and 1000000",
    );
  }

  return {
    ...baseInput,
    selectedModel: modelId,
    estimatedOutputTokens: outputTokens,
  };
}
