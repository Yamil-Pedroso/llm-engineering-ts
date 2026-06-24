import { currencyConverter } from "./currency.service";
import {
  ModelConfig,
  TokenizerCostEstimate,
} from "./tokenizer.types";
import { calculateTokenCost, roundCurrency } from "./tokenizer.utils";

export interface CostEstimateInput {
  model: ModelConfig;
  inputTokens: number;
  estimatedOutputTokens: number;
}

export function estimateTokenizerCost({
  model,
  inputTokens,
  estimatedOutputTokens,
}: CostEstimateInput): TokenizerCostEstimate {
  const inputCostUSD = calculateTokenCost(
    inputTokens,
    model.inputPricePerMillionUSD,
  );
  const outputCostUSD = calculateTokenCost(
    estimatedOutputTokens,
    model.outputPricePerMillionUSD,
  );
  const totalCostUSD = inputCostUSD + outputCostUSD;

  return {
    inputCostUSD: roundCurrency(inputCostUSD),
    outputCostUSD: roundCurrency(outputCostUSD),
    totalCostUSD: roundCurrency(totalCostUSD),
    totalCostCHF: roundCurrency(
      currencyConverter.convertUsdToChf(totalCostUSD),
    ),
    usdToChfRate: currencyConverter.getUsdToChfRate(),
  };
}
