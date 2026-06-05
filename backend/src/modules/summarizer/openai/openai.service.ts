import { scrapeWebsite } from "../../scraping/scraping.service";
import { openai } from "../../../config/openai";

const MODEL = "gpt-4.1-mini";

export async function summarizeWebsiteWithOpenAI(url: string) {
  const startedAt = performance.now();

  console.log("1. Starting scrape:", url);

  const website = await scrapeWebsite(url);

  console.log("2. Scrape done:", {
    title: website.title,
    textLength: website.text.length,
  });

  console.log("3. Calling OpenAI...");

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You summarize websites clearly, concisely, and professionally.",
      },
      {
        role: "user",
        content: `
URL:
${website.url}

Title:
${website.title}

Website content:
${website.text.slice(0, 12000)}
        `,
      },
    ],
  });

  console.log("4. OpenAI response received");

  const finishedAt = performance.now();

  return {
    url: website.url,
    title: website.title,
    content: website.text.slice(0, 12000),
    summarizedWebsite: response.choices[0].message.content,
    metrics: {
      model: MODEL,
      durationMs: Math.round(finishedAt - startedAt),
      promptTokens: response.usage?.prompt_tokens ?? null,
      completionTokens: response.usage?.completion_tokens ?? null,
      totalTokens: response.usage?.total_tokens ?? null,
    },
  };
}
