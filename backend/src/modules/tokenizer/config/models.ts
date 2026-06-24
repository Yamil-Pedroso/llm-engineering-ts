import { ModelConfig } from "../tokenizer.types";

/**
 * Pricing is expressed per one million tokens for standard API processing.
 * Update this catalog when providers change model names or published rates.
 */
export const TOKENIZER_MODELS: readonly ModelConfig[] = [
  {
    modelId: "educational",
    displayName: "Educational Tokenizer",
    provider: "Local",
    tokenizerType: "educational",
    inputPricePerMillionUSD: 0,
    outputPricePerMillionUSD: 0,
    notes: "Local learning mode. It does not represent provider billing.",
    isLocalModel: true,
    pricingLastUpdated: "not-applicable",
  },
  {
    modelId: "gpt-4o",
    displayName: "GPT-4o",
    provider: "OpenAI",
    tokenizerType: "openai",
    inputPricePerMillionUSD: 2.5,
    outputPricePerMillionUSD: 10,
    notes: "Uses the OpenAI-compatible o200k_base tokenizer.",
    isLocalModel: false,
    pricingLastUpdated: "2026-06-24",
  },
  {
    modelId: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    provider: "OpenAI",
    tokenizerType: "openai",
    inputPricePerMillionUSD: 0.15,
    outputPricePerMillionUSD: 0.6,
    notes: "Uses the OpenAI-compatible o200k_base tokenizer.",
    isLocalModel: false,
    pricingLastUpdated: "2026-06-24",
  },
  {
    modelId: "llama-3.1-8b",
    displayName: "Llama 3.1 8B",
    provider: "Hosted inference reference",
    tokenizerType: "llama",
    inputPricePerMillionUSD: 0.18,
    outputPricePerMillionUSD: 0.18,
    notes:
      "Estimated tokenizer fallback. Open-weight model pricing varies by host.",
    isLocalModel: false,
    pricingLastUpdated: "2026-06-24",
  },
  {
    modelId: "llama-3.1-70b",
    displayName: "Llama 3.1 70B",
    provider: "Hosted inference reference",
    tokenizerType: "llama",
    inputPricePerMillionUSD: 0.88,
    outputPricePerMillionUSD: 0.88,
    notes:
      "Estimated tokenizer fallback. Open-weight model pricing varies by host.",
    isLocalModel: false,
    pricingLastUpdated: "2026-06-24",
  },
  {
    modelId: "claude-sonnet",
    displayName: "Claude Sonnet",
    provider: "Anthropic",
    tokenizerType: "anthropic",
    inputPricePerMillionUSD: 3,
    outputPricePerMillionUSD: 15,
    notes:
      "Estimated tokenizer fallback. Exact usage comes from the Anthropic API response.",
    isLocalModel: false,
    pricingLastUpdated: "2026-06-24",
  },
  {
    modelId: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    provider: "Google",
    tokenizerType: "gemini",
    inputPricePerMillionUSD: 0.3,
    outputPricePerMillionUSD: 2.5,
    notes:
      "Estimated tokenizer fallback. Exact usage comes from Gemini usage metadata.",
    isLocalModel: false,
    pricingLastUpdated: "2026-06-24",
  },
  {
    modelId: "hf-placeholder",
    displayName: "Hugging Face Model",
    provider: "Hugging Face",
    tokenizerType: "hugging-face",
    inputPricePerMillionUSD: 0,
    outputPricePerMillionUSD: 0,
    notes:
      "Tokenizer adapter placeholder. Configure a concrete model and inference provider price.",
    isLocalModel: false,
    pricingLastUpdated: "manual-update-required",
  },
] as const;

export const DEFAULT_TOKENIZER_MODEL_ID = "gpt-4o-mini";

export function findTokenizerModel(modelId: string): ModelConfig | undefined {
  return TOKENIZER_MODELS.find((model) => model.modelId === modelId);
}
