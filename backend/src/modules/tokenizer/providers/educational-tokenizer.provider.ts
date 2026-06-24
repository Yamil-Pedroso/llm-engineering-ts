import {
  ModelConfig,
  ProviderTokenizeResult,
  Token,
  TokenizeInput,
  TokenizerProvider,
} from "../tokenizer.types";
import { classifyTokenValue } from "./token-classifier";

const TOKEN_PATTERN =
  /(\s+|\p{N}+(?:[.,]\p{N}+)*|\p{L}+(?:['’]\p{L}+)*|\p{P}|\p{S}|[^\s\p{L}\p{N}\p{P}\p{S}])/gu;

export class EducationalTokenizerProvider implements TokenizerProvider {
  readonly tokenizerType = "educational" as const;

  tokenize(
    { text, includeSpaces = false }: TokenizeInput,
    _model: ModelConfig,
  ): ProviderTokenizeResult {
    const values = text.match(TOKEN_PATTERN) ?? [];
    const visibleValues = includeSpaces
      ? values
      : values.filter(
          (value) => classifyTokenValue(value) !== "whitespace",
        );
    const tokens: Token[] = visibleValues.map((value, id) => ({
      id,
      value,
      type: classifyTokenValue(value),
    }));

    return {
      originalText: text,
      tokens,
      tokenCount: tokens.length,
      tokenizerType: this.tokenizerType,
      tokenizerAccuracy: "educational",
      tokenizerNotes:
        "Rule-based learning tokenizer. It does not match a provider vocabulary.",
    };
  }
}
