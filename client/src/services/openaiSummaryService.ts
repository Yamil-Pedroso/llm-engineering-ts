import apiClient from "../api/apiClient";

export type OpenAISummaryResponse = {
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

export async function summarizeWebsiteWithOpenAI(
  url: string,
): Promise<OpenAISummaryResponse> {
  const res = await apiClient.get(`/openai/summarized-website`, {
    params: { url },
  });
  console.log(res.data);
  return res.data.summarizedWebsite;
}
