export type ToolPlannerInput = {
  goal: string;
  hoursAvailable: number;
  budgetUsd: number;
};

export type ToolCallResult = {
  toolName: string;
  description: string;
  input: Record<string, string | number>;
  output: Record<string, string | number | string[]>;
};

export type ToolPlannerResponse = {
  goal: string;
  recommendation: string;
  toolCalls: ToolCallResult[];
};

function estimateBuildScope(input: ToolPlannerInput): ToolCallResult {
  const complexity =
    input.goal.length > 90 || input.hoursAvailable < 6
      ? "focused prototype"
      : "full learning sprint";

  return {
    toolName: "estimateBuildScope",
    description: "Estimates a realistic implementation scope from the goal.",
    input: {
      goal: input.goal,
      hoursAvailable: input.hoursAvailable,
    },
    output: {
      complexity,
      suggestedMilestones:
        complexity === "focused prototype"
          ? ["Define one use case", "Build API contract", "Ship UI demo"]
          : [
              "Map requirements",
              "Build backend flow",
              "Connect frontend",
              "Add validation",
            ],
    },
  };
}

function calculateBudgetFit(input: ToolPlannerInput): ToolCallResult {
  const hourlyLearningCost = 18;
  const estimatedCost = Math.round(input.hoursAvailable * hourlyLearningCost);
  const fit = input.budgetUsd >= estimatedCost ? "comfortable" : "tight";

  return {
    toolName: "calculateBudgetFit",
    description: "Checks whether the available budget fits the plan.",
    input: {
      hoursAvailable: input.hoursAvailable,
      budgetUsd: input.budgetUsd,
    },
    output: {
      estimatedCost,
      fit,
    },
  };
}

function chooseLearningWorkflow(input: ToolPlannerInput): ToolCallResult {
  const workflow =
    input.hoursAvailable >= 10
      ? "research, build, evaluate, iterate"
      : "build a thin vertical slice first";

  return {
    toolName: "chooseLearningWorkflow",
    description: "Selects the workflow that best matches the constraints.",
    input: {
      hoursAvailable: input.hoursAvailable,
      goal: input.goal,
    },
    output: {
      workflow,
      firstAction:
        input.hoursAvailable >= 10
          ? "Write a short spec before coding."
          : "Create one endpoint and one UI interaction.",
    },
  };
}

export function createToolPlanner(input: ToolPlannerInput): ToolPlannerResponse {
  const toolCalls = [
    estimateBuildScope(input),
    calculateBudgetFit(input),
    chooseLearningWorkflow(input),
  ];

  const budgetFit = String(toolCalls[1].output.fit);
  const workflow = String(toolCalls[2].output.workflow);

  return {
    goal: input.goal,
    recommendation: `Use ${workflow}. Your budget fit looks ${budgetFit}, so keep the first version small and validate it quickly.`,
    toolCalls,
  };
}
