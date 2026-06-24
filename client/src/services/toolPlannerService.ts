import apiClient from "../api/apiClient";

export type ToolPlannerRequest = {
  goal: string;
  hoursAvailable: number;
  budgetUsd: number;
};

export type ToolCallResult = {
  toolName: string;
  description: string;
  input: Record<string, string | number>;
  output: Record<string, string | number | string[]>;
};

export type ToolPlannerResponse = {
  goal: string;
  recommendation: string;
  toolCalls: ToolCallResult[];
};

export async function createToolPlan(
  payload: ToolPlannerRequest,
): Promise<ToolPlannerResponse> {
  const response = await apiClient.post<ToolPlannerResponse>(
    "/tools/plan",
    payload,
  );

  return response.data;
}
