import { Router } from "express";
import { analyzeQuantizationController } from "./quantization.controller";

const router = Router();

// Example: { "weights": [0.123456, -0.987654], "parameterCount": 8000000000 }
router.post("/quantization/analyze", analyzeQuantizationController);

export default router;
