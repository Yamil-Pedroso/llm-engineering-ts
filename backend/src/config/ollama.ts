import OpenAI from "openai";
import { chromium } from "playwright";
import * as cheerio from "cheerio";

const ollama = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

const MODEL = "llama3.2";

async function scrapeWebsite(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await page.waitForTimeout(3000);

  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  $("script, style, img, input").remove();

  return {
    url,
    title: $("title").text(),
    text: $("body").text().replace(/\s+/g, " ").trim(),
  };
}

export async function summarizeWebsite(url: string) {
  const startedAt = performance.now();

  const website = await scrapeWebsite(url);

  const response = await ollama.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You summarize websites clearly and concisely.",
      },
      {
        role: "user",
        content: `
URL: ${website.url}
Title: ${website.title}

Content:
${website.text.slice(0, 12000)}
        `,
      },
    ],
  });

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
