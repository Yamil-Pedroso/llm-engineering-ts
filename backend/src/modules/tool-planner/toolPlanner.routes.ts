import { Router } from "express";
import { createToolPlannerController } from "./toolPlanner.controller";

const router = Router();

router.post("/tools/plan", createToolPlannerController);

export default router;
