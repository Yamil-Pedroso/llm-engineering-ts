import {
  DEFAULT_TOKENIZER_MODEL_ID,
  findTokenizerModel,
  TOKENIZER_MODELS,
} from "./config/models";
import { getTokenizerProvider } from "./providers/tokenizer-provider.factory";
import { estimateTokenizerCost } from "./tokenizer-cost.service";
import {
  AnalyzeTokenizerInput,
  ModelConfig,
  TokenAnalysisResult,
  TokenizeInput,
  TokenizeResult,
} from "./tokenizer.types";

const BILLING_DISCLAIMER =
  "This is an estimate. Exact billing depends on provider tokenization, request framing, cached tokens, reasoning tokens, service tier, and usage metadata returned by the provider API.";

export function listTokenizerModels(): readonly ModelConfig[] {
  return TOKENIZER_MODELS;
}

export function tokenizeText(input: TokenizeInput): TokenizeResult {
  const model = findTokenizerModel("educational");

  if (!model) {
    throw new Error("Educational tokenizer model is not configured");
  }

  return getTokenizerProvider("educational").tokenize(input, model);
}

export function analyzeText(
  input: AnalyzeTokenizerInput,
): TokenAnalysisResult {
  const model =
    findTokenizerModel(input.selectedModel) ??
    findTokenizerModel(DEFAULT_TOKENIZER_MODEL_ID);

  if (!model) {
    throw new Error("Default tokenizer model is not configured");
  }

  const provider = getTokenizerProvider(model.tokenizerType);
  const tokenization = provider.tokenize(input, model);
  const inputTokens = tokenization.tokenCount;

  return {
    ...tokenization,
    characterCount: Array.from(input.text).length,
    wordCount: input.text.match(/\p{L}+(?:['’]\p{L}+)*/gu)?.length ?? 0,
    inputTokens,
    estimatedOutputTokens: input.estimatedOutputTokens,
    selectedModel: model,
    costEstimate: estimateTokenizerCost({
      model,
      inputTokens,
      estimatedOutputTokens: input.estimatedOutputTokens,
    }),
    disclaimer: BILLING_DISCLAIMER,
  };
}
