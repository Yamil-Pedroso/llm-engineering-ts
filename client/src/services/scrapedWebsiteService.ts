import apiClient from "../api/apiClient";

export type OllamaAISummaryResponse = {
  url: string;
  title: string;
  summarizedWebsite: string;
  content: string;
  metrics: {
    model: string;
    durationMs: number;
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
  };
};

export async function fetchScrapedWebsite(
  url: string,
): Promise<OllamaAISummaryResponse> {
  const res = await apiClient.get(
    `/summarized-website?url=${encodeURIComponent(url)}`,
  );

  if (res.status !== 200) {
    throw new Error(res.data.message ?? "Failed to fetch scraped website");
  }
  console.log(res.data.summarizedWebsite);
  return res.data.summarizedWebsite;
}
