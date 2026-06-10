import { useState } from "react";
import { motion } from "framer-motion";
import { useOpenAISummary } from "../lib/hooks/useOpenAISummary";
import { ColoredText } from "./ColoredText";

export function OpenAISummaryView() {
  const [inputUrl, setInputUrl] = useState("");
  const { data, loading, progress, status, error, summarize } =
    useOpenAISummary();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    summarize(inputUrl);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full min-w-0 flex-col gap-8 text-white"
    >
      <div>
        <p className="inline-flex text-[1rem] font-medium uppercase tracking-[0.2em] text-emerald-300">
          OpenAI Website Summarizer
        </p>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
          Scrape and summarize any website
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Insert a URL, extract its content, summarize it with OpenAI.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row"
      >
        <input
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://react.dev"
          className="min-h-12 flex-1 border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/50 focus:ring-4 focus:ring-emerald-500/10"
        />

        <button
          disabled={loading}
          className="min-h-12 rounded-full  bg-emerald-500 px-6 py-3 font-medium text-white transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Working..." : "Summarize"}
        </button>
      </form>

      {(loading || progress > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/10 bg-white/3 p-4"
        >
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-zinc-400">{status}</span>
            <span className="font-medium text-emerald-300">{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden bg-white/5">
            <motion.div
              className="h-full bg-linear-to-r from-emerald-500 to-emerald-400"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </motion.div>
      )}

      {data && (
        <motion.div
          initial={{ opacity: 0, y: 22, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <article className="h-80 min-w-0 overflow-y-auto overflow-x-hidden border border-white/10 bg-white/2 p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {data.title}
            </h2>

            <p className="mt-2 break-all text-sm text-emerald-300">
              {data.url}
            </p>

            <ColoredText text={data.summarizedWebsite} variant="emerald" />
          </article>

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            <Metric label="Model" value={data.metrics.model} />
            <Metric label="Time" value={`${data.metrics.durationMs}ms`} />
            <Metric
              label="Prompt tokens"
              value={data.metrics.promptTokens ?? "N/A"}
            />
            <Metric
              label="Total tokens"
              value={data.metrics.totalTokens ?? "N/A"}
            />
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="border border-white/10 bg-white/3 p-4"
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">{value}</p>
    </motion.div>
  );
}
