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

export interface ModelConfig {
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

export interface TokenizeInput {
  text: string;
  includeSpaces?: boolean;
}

export interface AnalyzeTokenizerInput extends TokenizeInput {
  selectedModel: string;
  estimatedOutputTokens: number;
}

export interface TokenizeResult {
  originalText: string;
  tokens: Token[];
  tokenCount: number;
}

export interface ProviderTokenizeResult extends TokenizeResult {
  tokenizerType: TokenizerType;
  tokenizerAccuracy: TokenizerAccuracy;
  tokenizerNotes: string;
}

export interface TokenizerCostEstimate {
  inputCostUSD: number;
  outputCostUSD: number;
  totalCostUSD: number;
  totalCostCHF: number;
  usdToChfRate: number;
}

export interface TokenAnalysisResult extends ProviderTokenizeResult {
  characterCount: number;
  wordCount: number;
  inputTokens: number;
  estimatedOutputTokens: number;
  selectedModel: ModelConfig;
  costEstimate: TokenizerCostEstimate;
  disclaimer: string;
}

export interface TokenizerProvider {
  readonly tokenizerType: TokenizerType;
  tokenize(input: TokenizeInput, model: ModelConfig): ProviderTokenizeResult;
}
