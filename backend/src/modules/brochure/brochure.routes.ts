import { Router } from "express";
import {
  createBrochureController,
  createBrochureStreamController,
} from "./brochure.controller";

const router = Router();

router.get("/brochure", createBrochureController);
router.get("/brochure/stream", createBrochureStreamController);

export default router;
