export type QuantizationPrecision = "FP32" | "FP16" | "INT8" | "INT4" | "INT2";

export interface QuantizationAnalyzeRequest {
  weights: number[];
  parameterCount: number;
}

export interface QuantizationResult {
  precision: QuantizationPrecision;
  bitsPerParameter: number;
  estimatedSizeGB: number;
  quantizedWeights: number[];
  averageAbsoluteError: number;
  memoryReductionPercentage: number;
  description: string;
}

export interface QuantizationAnalysis {
  originalWeights: number[];
  parameterCount: number;
  fp32EstimatedSizeGB: number;
  results: QuantizationResult[];
  disclaimer: string;
}

export type CompressionStatus = "idle" | "compressing" | "complete";

export interface CompressionResult {
  modelName: string;
  original: QuantizationResult;
  compressed: QuantizationResult;
}
