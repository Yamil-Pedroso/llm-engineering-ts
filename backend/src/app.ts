import express from "express";
import cors from "cors";
import ollamaRoutes from "./modules/summarizer/ollama/ollama.routes";
import openaiRoutes from "./modules/summarizer/openai/openai.routes";
import brochureRoutes from "./modules/brochure/brochure.routes";

const app = express();

app.use(cors());

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
