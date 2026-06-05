import { openai } from "../../config/openai";
import {
  fetchWebsiteContents,
  fetchWebsiteLinks,
} from "../scraping/scraping.service";

const linkSelectionModel = "gpt-4.1-mini";
const brochureModel = "gpt-4.1-mini";

const linkSystemPrompt = `
You are provided with a list of links found on a webpage.
You are able to decide which of the links would be most relevant to include in a brochure about the company,
such as links to an About page, or a Company page, or Careers/Jobs pages.
You should respond in JSON as in this example:

{
    "links": [
        {"type": "about page", "url": "https://full.url/goes/here/about"},
        {"type": "careers page", "url": "https://another.full.url/careers"}
    ]
}
`;

const brochureSystemPrompt = `
You are an assistant that analyzes the contents of several relevant pages from a company website
and creates a short brochure about the company for prospective customers, investors and recruits.
Respond in markdown without code blocks.
Include details of company culture, customers and careers/jobs if you have the information.
`;

async function getLinksUserPrompt(url: string): Promise<string> {
  let userPrompt = `Here is the list of links on the website ${url} -
Please decide which of these are relevant web links for a brochure about the company,
respond with the full https URL in JSON format.
Do not include Terms of Service, Privacy, email links.

Links (some might be relative links):

`;
  const links = await fetchWebsiteLinks(url);
  userPrompt += links.join("\n");
  return userPrompt;
}

async function selectRelevantLinks(url: string) {
  console.log(`Selecting relevant links for ${url} by calling ${linkSelectionModel}`);
  const response = await openai.chat.completions.create({
    model: linkSelectionModel,
    messages: [
      { role: "system", content: linkSystemPrompt },
      { role: "user", content: await getLinksUserPrompt(url) },
    ],
    response_format: { type: "json_object" },
  });
  const result = response.choices[0]?.message?.content;
  if (!result) throw new Error("No response from OpenAI");
  const links = JSON.parse(result);
  console.log(`Found ${links.links.length} relevant links`);
  return links;
}

async function fetchPageAndAllRelevantLinks(url: string): Promise<string> {
  const contents = await fetchWebsiteContents(url);
  const relevantLinks = await selectRelevantLinks(url);
  let result = `## Landing Page:\n\n${contents}\n## Relevant Links:\n`;
  for (const link of relevantLinks.links) {
    result += `\n\n### Link: ${link.type}\n`;
    result += await fetchWebsiteContents(link.url);
  }
  return result;
}

async function getBrochureUserPrompt(
  companyName: string,
  url: string,
): Promise<string> {
  let userPrompt = `You are looking at a company called: ${companyName}
Here are the contents of its landing page and other relevant pages;
use this information to build a short brochure of the company in markdown without code blocks.\n\n`;
  userPrompt += await fetchPageAndAllRelevantLinks(url);
  userPrompt = userPrompt.slice(0, 5000);
  return userPrompt;
}

export async function createBrochure(companyName: string, url: string) {
  const response = await openai.chat.completions.create({
    model: brochureModel,
    messages: [
      { role: "system", content: brochureSystemPrompt },
      { role: "user", content: await getBrochureUserPrompt(companyName, url) },
    ],
  });
  const result = response.choices[0]?.message?.content;
  return { companyName, url, brochure: result };
}

export async function createBrochureStream(
  companyName: string,
  url: string,
): Promise<ReadableStream> {
  const stream = await openai.chat.completions.create({
    model: brochureModel,
    messages: [
      { role: "system", content: brochureSystemPrompt },
      { role: "user", content: await getBrochureUserPrompt(companyName, url) },
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });
}
