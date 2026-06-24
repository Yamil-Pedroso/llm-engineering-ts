import { MAX_SAMPLE_WEIGHTS } from "./quantization.config";
import { QuantizationInput } from "./quantization.types";

export class QuantizationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuantizationValidationError";
  }
}

export function validateQuantizationInput(body: unknown): QuantizationInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new QuantizationValidationError("Request body must be an object");
  }

  const { weights, parameterCount } = body as Record<string, unknown>;

  if (!Array.isArray(weights)) {
    throw new QuantizationValidationError("weights must be an array");
  }

  if (weights.length === 0) {
    throw new QuantizationValidationError("weights cannot be empty");
  }

  if (weights.length > MAX_SAMPLE_WEIGHTS) {
    throw new QuantizationValidationError(
      `weights cannot contain more than ${MAX_SAMPLE_WEIGHTS} samples`,
    );
  }

  if (
    !weights.every(
      (weight): weight is number =>
        typeof weight === "number" && Number.isFinite(weight),
    )
  ) {
    throw new QuantizationValidationError(
      "weights must contain only finite numbers",
    );
  }

  if (
    typeof parameterCount !== "number" ||
    !Number.isFinite(parameterCount) ||
    parameterCount <= 0
  ) {
    throw new QuantizationValidationError(
      "parameterCount must be a positive number",
    );
  }

  return {
    weights,
    parameterCount,
  };
}
