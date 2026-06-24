import apiClient from "../api/apiClient";
import type {
  TokenizerAnalysis,
  TokenizerAnalyzeRequest,
  TokenizerModelsResponse,
} from "../types/tokenizer.types";

export async function analyzeText(
  payload: TokenizerAnalyzeRequest,
): Promise<TokenizerAnalysis> {
  const response = await apiClient.post<TokenizerAnalysis>(
    "/tokenizer/analyze",
    payload,
  );

  return response.data;
}

export async function getTokenizerModels(): Promise<TokenizerModelsResponse> {
  const response =
    await apiClient.get<TokenizerModelsResponse>("/tokenizer/models");

  return response.data;
}
