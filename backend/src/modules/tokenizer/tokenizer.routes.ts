import { Router } from "express";
import {
  analyzeTokenizerController,
  listTokenizerModelsController,
  tokenizeController,
} from "./tokenizer.controller";

const router = Router();

// Example: { "text": "LLMs use 42 tokens!", "includeSpaces": false }
router.post("/tokenizer/tokenize", tokenizeController);

// Example: { "text": "Hello world", "selectedModel": "gpt-4o-mini", "estimatedOutputTokens": 500 }
router.post("/tokenizer/analyze", analyzeTokenizerController);

router.get("/tokenizer/models", listTokenizerModelsController);

export default router;
