import OpenAI from "openai";
import { chromium } from "playwright";
import * as cheerio from "cheerio";

const ollama = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434/v1",
  apiKey: "ollama",
});

const MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

async function scrapeWebsite(url: string) {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(1000);

    const html = await page.content();

    const $ = cheerio.load(html);

    $("script, style, img, input, svg, iframe, noscript").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim();

    return {
      url,
      title: $("title").text() || "Untitled",
      text,
    };
  } finally {
    await browser.close();
  }
}

export async function summarizeWebsite(url: string) {
  const startedAt = performance.now();

  console.log("Ollama route hit:", url);

  const website = await scrapeWebsite(url);

  console.log("Scrape completed:", {
    title: website.title,
    textLength: website.text.length,
  });

  const response = await ollama.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `
You are an expert website summarizer.

Create:
- A short overview
- Key points
- Main purpose of the website

Keep the answer concise and professional.
        `,
      },
      {
        role: "user",
        content: `
URL: ${website.url}
Title: ${website.title}

Website Content:
${website.text.slice(0, 3000)}
        `,
      },
    ],
    max_tokens: 250,
    temperature: 0.3,
  });

  const finishedAt = performance.now();

  return {
    url: website.url,
    title: website.title,
    content: website.text.slice(0, 3000),
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
