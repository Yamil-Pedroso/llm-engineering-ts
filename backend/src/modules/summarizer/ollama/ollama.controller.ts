import { Request, Response } from "express";
import { summarizeWebsite } from "../../../config/ollama";

export async function getSummarizedWebsiteController(
  req: Request,
  res: Response,
) {
  try {
    const url = typeof req.query.url === "string" ? req.query.url : undefined;
    if (!url) {
      return res
        .status(400)
        .json({ message: "URL is required (query: ?url=...)" });
    }
    const summarizedWebsite = await summarizeWebsite(url);
    if (summarizedWebsite == null) {
      return res
        .status(502)
        .json({ message: "No summary returned from model" });
    }
    return res.json({ summarizedWebsite });
  } catch (error) {
    console.error("Ollama get summarized website error:", error);
    return res
      .status(500)
      .json({ message: "Failed to get summarized website" });
  }
}

export async function summarizeWebsiteController(req: Request, res: Response) {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const summary = await summarizeWebsite(url);

    return res.json({ summary });
  } catch (error) {
    console.error("Ollama summary error:", error);
    return res.status(500).json({ message: "Failed to summarize website" });
  }
}
