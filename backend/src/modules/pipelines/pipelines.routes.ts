import { Router } from "express";
import {
  audioGenerationController,
  classificationController,
  questionAnsweringController,
  summarizationController,
  textGenerationController,
  translationController,
} from "./pipelines.controller";

const router = Router();

// Example: { "question": "Who created React?", "context": "React was created by Facebook and Jordan Walke." }
router.post("/pipelines/question-answering", questionAnsweringController);

// Example: { "text": "Long article..." }
router.post("/pipelines/summarize", summarizationController);

// Example: { "text": "Hello world", "sourceLanguage": "en", "targetLanguage": "es" }
router.post("/pipelines/translate", translationController);

// Example: { "text": "I love programming.", "classificationType": "sentiment-analysis" }
router.post("/pipelines/classify", classificationController);

// Example: { "prompt": "Explain what a Transformer model is.", "temperature": 0.7, "maxNewTokens": 200, "topP": 0.95 }
router.post("/pipelines/generate", textGenerationController);

// Example: { "text": "Welcome to my application.", "voice": "alloy", "format": "mp3" }
router.post("/pipelines/audio-generation", audioGenerationController);

export default router;
