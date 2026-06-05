import { useCallback, useState } from "react";
import {
  summarizeWebsiteWithOpenAI,
  type OpenAISummaryResponse,
} from "../../services/openaiSummaryService";

export function useOpenAISummary() {
  const [data, setData] = useState<OpenAISummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);

  const summarize = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setProgress(15);
    setStatus("Preparing request...");

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev < 35) {
          setStatus("Scraping website...");
          return prev + 5;
        }

        if (prev < 70) {
          setStatus("Cleaning content...");
          return prev + 4;
        }

        if (prev < 92) {
          setStatus("Generating summary...");
          return prev + 2;
        }

        return prev;
      });
    }, 450);

    try {
      const result = await summarizeWebsiteWithOpenAI(url);

      setData(result);
      setProgress(100);
      setStatus("Summary completed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setProgress(0);
      setStatus("Failed");
    } finally {
      window.clearInterval(interval);
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    progress,
    status,
    error,
    summarize,
  };
}
