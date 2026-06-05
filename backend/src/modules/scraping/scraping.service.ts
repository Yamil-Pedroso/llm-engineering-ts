import { chromium } from "playwright";
import * as cheerio from "cheerio";
import axios from "axios";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
};

export async function scrapeWebsite(url: string) {
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

  $("script, style, img, input, noscript").remove();

  return {
    url,
    title: $("title").text().trim(),
    text: $("body").text().replace(/\s+/g, " ").trim(),
  };
}

export async function fetchWebsiteContents(url: string): Promise<string> {
  const response = await axios.get(url, { headers });
  const $ = cheerio.load(response.data);
  const title = $("title").text() || "No title found";
  $("script, style, img, input").remove();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  return (title + "\n\n" + text).slice(0, 2000);
}

export async function fetchWebsiteLinks(url: string): Promise<string[]> {
  const response = await axios.get(url, { headers });
  const $ = cheerio.load(response.data);
  const links: string[] = [];
  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href) links.push(href);
  });
  return links;
}
