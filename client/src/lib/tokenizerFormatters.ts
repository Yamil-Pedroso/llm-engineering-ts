import type { TokenType } from "../types/tokenizer.types";

export function formatEstimatedCost(
  value: number,
  currency: "USD" | "CHF",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 6,
    maximumFractionDigits: 8,
  }).format(value);
}

export function formatTokenValue(value: string, type: TokenType): string {
  if (type !== "whitespace") {
    return value;
  }

  return value
    .replaceAll(" ", "·")
    .replaceAll("\n", "↵")
    .replaceAll("\t", "→");
}
