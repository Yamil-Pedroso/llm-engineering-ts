import { useCallback, useState } from "react";
import {
  createToolPlan,
  type ToolPlannerRequest,
  type ToolPlannerResponse,
} from "../../services/toolPlannerService";

export function useToolPlanner() {
  const [data, setData] = useState<ToolPlannerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = useCallback(async (payload: ToolPlannerRequest) => {
    if (!payload.goal.trim()) {
      setError("Write a goal before running the tools.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await createToolPlan(payload);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    plan,
  };
}
