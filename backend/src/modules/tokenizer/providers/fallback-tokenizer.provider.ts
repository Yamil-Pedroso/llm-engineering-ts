import {
  ModelConfig,
  ProviderTokenizeResult,
  TokenizeInput,
  TokenizerProvider,
  TokenizerType,
} from "../tokenizer.types";
import { EducationalTokenizerProvider } from "./educational-tokenizer.provider";

export class FallbackTokenizerProvider implements TokenizerProvider {
  private readonly fallback = new EducationalTokenizerProvider();

  constructor(readonly tokenizerType: TokenizerType) {}

  tokenize(
    input: TokenizeInput,
    model: ModelConfig,
  ): ProviderTokenizeResult {
    const result = this.fallback.tokenize(input, model);

    return {
      ...result,
      tokenizerType: this.tokenizerType,
      tokenizerAccuracy: "estimated",
      tokenizerNotes: `${model.provider} tokenizer placeholder using the educational fallback. Exact billing requires provider usage metadata.`,
    };
  }
}
