import {
  encodingForModel,
  Tiktoken,
  TiktokenModel,
} from "js-tiktoken";
import {
  ModelConfig,
  ProviderTokenizeResult,
  TokenizeInput,
  TokenizerProvider,
} from "../tokenizer.types";
import { classifyTokenValue } from "./token-classifier";

const SUPPORTED_MODELS: ReadonlySet<string> = new Set([
  "gpt-4o",
  "gpt-4o-mini",
]);

export class OpenAITokenizerProvider implements TokenizerProvider {
  readonly tokenizerType = "openai" as const;
  private readonly encodings = new Map<string, Tiktoken>();

  tokenize(
    { text }: TokenizeInput,
    model: ModelConfig,
  ): ProviderTokenizeResult {
    if (!SUPPORTED_MODELS.has(model.modelId)) {
      throw new Error(`Unsupported OpenAI tokenizer model: ${model.modelId}`);
    }

    const encoding =
      this.encodings.get(model.modelId) ??
      encodingForModel(model.modelId as TiktokenModel);
    this.encodings.set(model.modelId, encoding);
    const tokenIds = encoding.encode(text);
    const tokens = tokenIds.map((tokenId, id) => {
      const value = encoding.decode([tokenId]);

      return {
        id,
        value,
        type: classifyTokenValue(value),
      };
    });

    return {
      originalText: text,
      tokens,
      tokenCount: tokenIds.length,
      tokenizerType: this.tokenizerType,
      tokenizerAccuracy: "exact",
      tokenizerNotes:
        "Counted with js-tiktoken using the model-compatible OpenAI BPE encoding.",
    };
  }
}
