import { TokenType } from "../tokenizer.types";

export function classifyTokenValue(value: string): TokenType {
  if (/^\s+$/u.test(value)) {
    return "whitespace";
  }

  const normalized = value.trim();

  if (/^\p{N}+(?:[.,]\p{N}+)*$/u.test(normalized)) {
    return "number";
  }

  if (/^\p{L}+(?:['’]\p{L}+)*$/u.test(normalized)) {
    return "word";
  }

  if (/^\p{P}+$/u.test(normalized)) {
    return "punctuation";
  }

  return "special";
}
