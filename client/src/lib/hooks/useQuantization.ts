import axios from "axios";
import { useCallback, useState } from "react";
import { analyzeQuantization } from "../../services/quantizationService";
import type {
  QuantizationAnalysis,
  QuantizationAnalyzeRequest,
} from "../../types/quantization.types";

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data.error ??
      error.response?.data.message ??
      "Quantization request failed"
    );
  }

  return error instanceof Error
    ? error.message
    : "Quantization request failed";
}

export function useQuantization() {
  const [data, setData] = useState<QuantizationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (input: QuantizationAnalyzeRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeQuantization(input);
      setData(response);
      return response;
    } catch (requestError) {
      setData(null);
      setError(getErrorMessage(requestError));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    error,
    isLoading,
    analyze,
    reset,
  };
}
