import { Router } from "express";
import {
  chatController,
  speechController,
  structuredBriefController,
  toolChatController,
} from "./aiSdk.controller";

const router = Router();

router.post("/ai-sdk/chat", chatController);
router.post("/ai-sdk/structured-brief", structuredBriefController);
router.post("/ai-sdk/tool-chat", toolChatController);
router.post("/ai-sdk/speech", speechController);

export default router;
