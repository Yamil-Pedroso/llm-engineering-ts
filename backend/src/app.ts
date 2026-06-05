import express from "express";
import cors from "cors";
import ollamaRoutes from "./modules/summarizer/ollama/ollama.routes";
import openaiRoutes from "./modules/summarizer/openai/openai.routes";
import brochureRoutes from "./modules/brochure/brochure.routes";
import { env } from "./config/env";

const app = express();

const allowedOrigins =
  env.NODE_ENV === "production" ? [env.CLIENT_URL] : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins as string[],
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "LLM Engineering TS API running",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    message: "OK UPDATED OPENAI TEST",
  });
});

app.get("/api/v1/openai/test-direct", (_req, res) => {
  res.json({ message: "Direct OpenAI test works" });
});

app.use("/api/v1", ollamaRoutes);
app.use("/api/v1", openaiRoutes);
app.use("/api/v1", brochureRoutes);

export default app;
