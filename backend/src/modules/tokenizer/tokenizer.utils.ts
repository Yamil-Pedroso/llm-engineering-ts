const TOKENS_PER_MILLION = 1_000_000;

export function calculateTokenCost(
  tokenCount: number,
  costPerMillionTokens: number,
): number {
  return (tokenCount / TOKENS_PER_MILLION) * costPerMillionTokens;
}

export function roundCurrency(value: number, decimalPlaces = 8): number {
  const factor = 10 ** decimalPlaces;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
