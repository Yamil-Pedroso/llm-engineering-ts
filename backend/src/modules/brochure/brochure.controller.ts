import { Request, Response } from "express";
import { createBrochure, createBrochureStream } from "./brochure.service";

export async function createBrochureController(req: Request, res: Response) {
  try {
    const companyName =
      typeof req.query.companyName === "string"
        ? req.query.companyName
        : undefined;
    const url = typeof req.query.url === "string" ? req.query.url : undefined;

    if (!companyName || !url) {
      return res.status(400).json({
        message:
          "companyName and url are required. Example: ?companyName=Acme&url=https://example.com",
      });
    }

    const brochure = await createBrochure(companyName, url);
    return res.json(brochure);
  } catch (error) {
    console.error("Brochure creation error:", error);
    return res.status(500).json({
      message: "Failed to create brochure",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function createBrochureStreamController(
  req: Request,
  res: Response,
) {
  try {
    const companyName =
      typeof req.query.companyName === "string"
        ? req.query.companyName
        : undefined;
    const url = typeof req.query.url === "string" ? req.query.url : undefined;

    if (!companyName || !url) {
      return res.status(400).json({
        message:
          "companyName and url are required. Example: ?companyName=Acme&url=https://example.com",
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await createBrochureStream(companyName, url);
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    async function push() {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(`data: ${JSON.stringify({ text: decoder.decode(value) })}\n\n`);
      push();
    }
    push();
  } catch (error) {
    console.error("Brochure stream error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Failed to stream brochure",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    res.end();
  }
}
