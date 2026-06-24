import { useCallback, useState } from "react";
import {
  classify,
  generateAudio,
  generateText,
  questionAnswering,
  summarize,
  translate,
  type PipelineResponse,
} from "../../services/pipelinesService";

export function usePipelines() {
  const [result, setResult] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPipeline = useCallback(async (request: () => Promise<PipelineResponse>) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setResult(await request());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pipeline request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    loading,
    error,
    clear,
    questionAnswering: (payload: Parameters<typeof questionAnswering>[0]) =>
      runPipeline(() => questionAnswering(payload)),
    summarize: (payload: Parameters<typeof summarize>[0]) =>
      runPipeline(() => summarize(payload)),
    translate: (payload: Parameters<typeof translate>[0]) =>
      runPipeline(() => translate(payload)),
    classify: (payload: Parameters<typeof classify>[0]) =>
      runPipeline(() => classify(payload)),
    generateText: (payload: Parameters<typeof generateText>[0]) =>
      runPipeline(() => generateText(payload)),
    generateAudio: (payload: Parameters<typeof generateAudio>[0]) =>
      runPipeline(() => generateAudio(payload)),
  };
}
