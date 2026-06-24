import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  analyzeText,
  getTokenizerModels,
} from "../../services/tokenizerService";
import type {
  TokenizerAnalysis,
  TokenizerAnalyzeRequest,
  TokenizerModel,
} from "../../types/tokenizer.types";

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data.error ??
      error.response?.data.message ??
      "Tokenizer request failed"
    );
  }

  return error instanceof Error ? error.message : "Tokenizer request failed";
}

export function useTokenizer() {
  const [data, setData] = useState<TokenizerAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<TokenizerModel[]>([]);
  const [modelsError, setModelsError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getTokenizerModels()
      .then((response) => {
        if (isActive) {
          setModels(response.models);
        }
      })
      .catch((requestError: unknown) => {
        if (isActive) {
          setModelsError(getErrorMessage(requestError));
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const analyze = useCallback(async (input: TokenizerAnalyzeRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeText(input);
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
    models,
    modelsError,
    analyze,
    reset,
  };
}
