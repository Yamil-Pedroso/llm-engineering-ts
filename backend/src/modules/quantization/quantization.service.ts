import { PRECISION_CONFIGS } from "./quantization.config";
import {
  QuantizationAnalysis,
  QuantizationInput,
  QuantizationPrecision,
  QuantizationResult,
} from "./quantization.types";

const BITS_PER_BYTE = 8;
const BYTES_PER_DECIMAL_GB = 1_000_000_000;

function round(value: number, decimalPlaces = 8): number {
  const factor = 10 ** decimalPlaces;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function toFloat16(value: number): number {
  if (!Number.isFinite(value) || value === 0) {
    return value;
  }

  const sign = Math.sign(value);
  const absoluteValue = Math.abs(value);

  if (absoluteValue > 65_504) {
    return sign * 65_504;
  }

  if (absoluteValue < 2 ** -24) {
    return sign * 0;
  }

  const exponent = Math.floor(Math.log2(absoluteValue));
  const step =
    exponent < -14 ? 2 ** -24 : 2 ** Math.max(exponent - 10, -24);

  return sign * Math.round(absoluteValue / step) * step;
}

function quantizeInteger(weights: number[], bits: number): number[] {
  const maxAbsoluteWeight = Math.max(...weights.map(Math.abs));

  if (maxAbsoluteWeight === 0) {
    return weights.map(() => 0);
  }

  const maxQuantizedValue = 2 ** (bits - 1) - 1;
  const scale = maxAbsoluteWeight / maxQuantizedValue;

  return weights.map((weight) => {
    const integerValue = Math.max(
      -maxQuantizedValue,
      Math.min(maxQuantizedValue, Math.round(weight / scale)),
    );

    return integerValue * scale;
  });
}

function quantizeWeights(
  weights: number[],
  precision: QuantizationPrecision,
): number[] {
  switch (precision) {
    case "FP32":
      return [...weights];
    case "FP16":
      return weights.map(toFloat16);
    case "INT8":
      return quantizeInteger(weights, 8);
    case "INT4":
      return quantizeInteger(weights, 4);
    case "INT2":
      return quantizeInteger(weights, 2);
  }
}

function calculateAverageAbsoluteError(
  originalWeights: number[],
  quantizedWeights: number[],
): number {
  const totalError = originalWeights.reduce(
    (sum, weight, index) =>
      sum + Math.abs(weight - quantizedWeights[index]),
    0,
  );

  return totalError / originalWeights.length;
}

function estimateModelSizeGB(
  parameterCount: number,
  bitsPerParameter: number,
): number {
  return (
    (parameterCount * bitsPerParameter) /
    BITS_PER_BYTE /
    BYTES_PER_DECIMAL_GB
  );
}

function analyzePrecision(
  input: QuantizationInput,
  precision: QuantizationPrecision,
  bitsPerParameter: number,
  description: string,
): QuantizationResult {
  const quantizedWeights = quantizeWeights(input.weights, precision);

  return {
    precision,
    bitsPerParameter,
    estimatedSizeGB: round(
      estimateModelSizeGB(input.parameterCount, bitsPerParameter),
      4,
    ),
    quantizedWeights: quantizedWeights.map((weight) => round(weight)),
    averageAbsoluteError: round(
      calculateAverageAbsoluteError(input.weights, quantizedWeights),
    ),
    memoryReductionPercentage: round(
      (1 - bitsPerParameter / 32) * 100,
      2,
    ),
    description,
  };
}

export function analyzeQuantization(
  input: QuantizationInput,
): QuantizationAnalysis {
  const results = PRECISION_CONFIGS.map((config) =>
    analyzePrecision(
      input,
      config.precision,
      config.bitsPerParameter,
      config.description,
    ),
  );

  return {
    originalWeights: input.weights,
    parameterCount: input.parameterCount,
    fp32EstimatedSizeGB: results[0].estimatedSizeGB,
    results,
    disclaimer:
      "This is a simplified per-tensor simulation. Real model files also contain scales, metadata, tensors with mixed precision, and runtime-specific overhead.",
  };
}
