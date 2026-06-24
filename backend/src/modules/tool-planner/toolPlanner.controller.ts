import { Request, Response } from "express";
import { createToolPlanner } from "./toolPlanner.service";

export function createToolPlannerController(req: Request, res: Response) {
  try {
    const goal = typeof req.body.goal === "string" ? req.body.goal.trim() : "";
    const hoursAvailable = Number(req.body.hoursAvailable);
    const budgetUsd = Number(req.body.budgetUsd);

    if (!goal) {
      return res.status(400).json({ message: "goal is required" });
    }

    if (!Number.isFinite(hoursAvailable) || hoursAvailable <= 0) {
      return res
        .status(400)
        .json({ message: "hoursAvailable must be greater than 0" });
    }

    if (!Number.isFinite(budgetUsd) || budgetUsd < 0) {
      return res
        .status(400)
        .json({ message: "budgetUsd must be 0 or greater" });
    }

    return res.json(
      createToolPlanner({
        goal,
        hoursAvailable,
        budgetUsd,
      }),
    );
  } catch (error) {
    console.error("Tool planner error:", error);
    return res.status(500).json({
      message: "Failed to create tool planner response",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
