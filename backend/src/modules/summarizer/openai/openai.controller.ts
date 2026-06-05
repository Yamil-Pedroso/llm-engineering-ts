import { Request, Response } from "express";
import { summarizeWebsiteWithOpenAI } from "./openai.service";

export async function summarizeWebsiteWithOpenAIController(
  req: Request,
  res: Response,
) {
  try {
    const url = typeof req.query.url === "string" ? req.query.url : undefined;

    console.log("Controller URL:", url);

    if (!url) {
      return res.status(400).json({
        message: "URL is required. Example: ?url=https://react.dev",
      });
    }

    const summarizedWebsite = await summarizeWebsiteWithOpenAI(url);

    if (summarizedWebsite == null) {
      return res
        .status(502)
        .json({ message: "No summary returned from model" });
    }
    return res.json({ summarizedWebsite });
  } catch (error) {
    console.error("OpenAI summarize website error:", error);

    return res.status(500).json({
      message: "Failed to summarize website with OpenAI",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
