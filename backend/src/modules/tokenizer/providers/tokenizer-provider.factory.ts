import { TokenizerProvider, TokenizerType } from "../tokenizer.types";
import { EducationalTokenizerProvider } from "./educational-tokenizer.provider";
import { FallbackTokenizerProvider } from "./fallback-tokenizer.provider";
import { OpenAITokenizerProvider } from "./openai-tokenizer.provider";

const providers: Record<TokenizerType, TokenizerProvider> = {
  educational: new EducationalTokenizerProvider(),
  openai: new OpenAITokenizerProvider(),
  "hugging-face": new FallbackTokenizerProvider("hugging-face"),
  llama: new FallbackTokenizerProvider("llama"),
  anthropic: new FallbackTokenizerProvider("anthropic"),
  gemini: new FallbackTokenizerProvider("gemini"),
};

export function getTokenizerProvider(
  tokenizerType: TokenizerType,
): TokenizerProvider {
  return providers[tokenizerType];
}
