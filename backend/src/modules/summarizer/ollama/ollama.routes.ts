import { Router } from "express";
import {
  getSummarizedWebsiteController,
  summarizeWebsiteController,
} from "./ollama.controller";

const router = Router();

router.get("/summarized-website", getSummarizedWebsiteController);

router.post("/summarize", summarizeWebsiteController);

export default router;
