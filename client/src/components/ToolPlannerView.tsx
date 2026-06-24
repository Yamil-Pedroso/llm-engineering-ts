import { useState } from "react";
import { motion } from "framer-motion";
import { useToolPlanner } from "../lib/hooks/useToolPlanner";

export function ToolPlannerView() {
  const [goal, setGoal] = useState(
    "Build a small LLM feature that explains tool calling with a backend and frontend.",
  );
  const [hoursAvailable, setHoursAvailable] = useState(8);
  const [budgetUsd, setBudgetUsd] = useState(120);
  const { data, loading, error, plan } = useToolPlanner();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    plan({ goal, hoursAvailable, budgetUsd });
  }

  return (
    <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-5 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Tools flow
          </p>

          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            Tool Planner
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Send a project goal to the backend and watch it run local tools for
            scope, budget, and workflow decisions.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Goal
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                rows={4}
                className="resize-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-300/20"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Hours
                <input
                  type="number"
                  min={1}
                  value={hoursAvailable}
                  onChange={(event) =>
                    setHoursAvailable(Number(event.target.value))
                  }
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-300/20"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Budget USD
                <input
                  type="number"
                  min={0}
                  value={budgetUsd}
                  onChange={(event) => setBudgetUsd(Number(event.target.value))}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-300/20"
                />
              </label>
            </div>

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 rounded-full bg-teal-700 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(15,118,110,0.24)] transition hover:-translate-y-0.5 hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {loading ? "Running tools..." : "Run tools"}
            </button>
          </form>
        </div>

        <div className="min-h-[360px] rounded-[1.75rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-inner sm:p-5">
          {!data ? (
            <div className="flex h-full min-h-[320px] items-center justify-center text-center text-sm leading-6 text-slate-400">
              Run the planner to see each backend tool call and its output.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
                  Recommendation
                </p>
                <p className="mt-2 rounded-xl bg-black/20 p-3 text-xs leading-5 text-slate-300">
                  Goal analyzed: {data.goal}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-100">
                  {data.recommendation}
                </p>
              </div>

              <div className="grid gap-3">
                {data.toolCalls.map((toolCall) => (
                  <article
                    key={toolCall.toolName}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
                  >
                    <h3 className="text-base font-black text-white">
                      {toolCall.toolName}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">
                      {toolCall.description}
                    </p>
                    <pre className="mt-3 max-h-44 overflow-auto rounded-xl bg-black/30 p-3 text-xs leading-5 text-teal-100">
                      {JSON.stringify(toolCall.output, null, 2)}
                    </pre>
                  </article>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
