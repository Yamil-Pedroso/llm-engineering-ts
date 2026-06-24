export type TokenType =
  | "word"
  | "number"
  | "punctuation"
  | "whitespace"
  | "special";

export type TokenizerType =
  | "educational"
  | "openai"
  | "hugging-face"
  | "llama"
  | "anthropic"
  | "gemini";

export type TokenizerAccuracy = "exact" | "estimated" | "educational";

export interface Token {
  id: number;
  value: string;
  type: TokenType;
}

export interface TokenizerModel {
  modelId: string;
  displayName: string;
  provider: string;
  tokenizerType: TokenizerType;
  inputPricePerMillionUSD: number;
  outputPricePerMillionUSD: number;
  notes: string;
  isLocalModel: boolean;
  pricingLastUpdated: string;
}

export interface TokenizerCostEstimate {
  inputCostUSD: number;
  outputCostUSD: number;
  totalCostUSD: number;
  totalCostCHF: number;
  usdToChfRate: number;
}

export interface TokenizerAnalyzeRequest {
  text: string;
  selectedModel: string;
  estimatedOutputTokens: number;
  includeSpaces?: boolean;
}

export interface TokenizerAnalysis {
  originalText: string;
  characterCount: number;
  wordCount: number;
  tokenCount: number;
  inputTokens: number;
  estimatedOutputTokens: number;
  tokens: Token[];
  tokenizerType: TokenizerType;
  tokenizerAccuracy: TokenizerAccuracy;
  tokenizerNotes: string;
  selectedModel: TokenizerModel;
  costEstimate: TokenizerCostEstimate;
  disclaimer: string;
}

export interface TokenizerModelsResponse {
  models: TokenizerModel[];
}
