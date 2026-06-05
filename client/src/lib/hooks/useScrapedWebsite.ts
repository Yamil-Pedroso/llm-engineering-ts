import { useState, useCallback } from "react";
import {
  fetchScrapedWebsite,
  type OllamaAISummaryResponse,
} from "../../services/scrapedWebsiteService";

export function useScrapedWebsite() {
  const [data, setData] = useState<OllamaAISummaryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [error, setError] = useState<string | null>(null);

  const scrape = useCallback(async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError(null);
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
      const result = await fetchScrapedWebsite(url);
      setProgress(100);
      setData([result]);
      setStatus("Summary completed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setData([]);
    } finally {
      window.clearInterval(interval);
      setLoading(false);
    }
  }, []);

  return { data, loading, error, progress, status, scrape };
}
