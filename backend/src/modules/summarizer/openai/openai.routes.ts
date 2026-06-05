import { Router } from "express";
import { summarizeWebsiteWithOpenAIController } from "./openai.controller";

const router = Router();

console.log("OpenAI routes loaded");

router.get(
  "/openai/summarized-website",
  (req, res, next) => {
    console.log("OpenAI route hit:", req.query.url);
    next();
  },
  summarizeWebsiteWithOpenAIController,
);

export default router;
