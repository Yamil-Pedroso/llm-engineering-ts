import { PrecisionConfig } from "./quantization.types";

export const PRECISION_CONFIGS: readonly PrecisionConfig[] = [
  {
    precision: "FP32",
    bitsPerParameter: 32,
    description:
      "Full 32-bit floating-point precision used as the reference representation.",
  },
  {
    precision: "FP16",
    bitsPerParameter: 16,
    description:
      "Half precision reduces memory while usually preserving small weight differences.",
  },
  {
    precision: "INT8",
    bitsPerParameter: 8,
    description:
      "Eight-bit integer quantization offers a strong balance between compact storage and approximation quality.",
  },
  {
    precision: "INT4",
    bitsPerParameter: 4,
    description:
      "Four-bit quantization is commonly used for memory-efficient local LLM inference.",
  },
  {
    precision: "INT2",
    bitsPerParameter: 2,
    description:
      "Two-bit quantization is extremely compact but introduces substantial approximation error.",
  },
] as const;

export const MAX_SAMPLE_WEIGHTS = 256;
