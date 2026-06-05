import { useState } from "react";
import { useScrapedWebsite } from "../lib/hooks/useScrapedWebsite";
import { ColoredText } from "./ColoredText";

export function ScrapedPageView() {
  const { data, loading, error, progress, status, scrape } =
    useScrapedWebsite();
  const [inputUrl, setInputUrl] = useState("");

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    scrape(inputUrl);
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-8 text-white">
      <div>
        <p className="inline-flex text-[1rem] font-medium uppercase tracking-[0.2em] text-indigo-300">
          Ollama Website Scraper
        </p>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
          Scrape website content
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Insert a URL, extract its page content, and preview the scraped text
          response.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="https://react.dev"
          className="
            min-h-12
            flex-1

            border
            border-white/10
            bg-black/40
            px-4
            py-3
            text-white
            outline-none
            transition
            placeholder:text-zinc-500
            focus:border-indigo-400/50
            focus:ring-4
            focus:ring-indigo-500/10
          "
        />

        <button
          type="submit"
          disabled={loading}
          className="
            min-h-12
            bg-indigo-500
            px-6
            py-3
            font-medium
            text-white
            transition-all
            hover:bg-indigo-400
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? "Scraping..." : "Scrape"}
        </button>
      </form>

      {(loading || progress > 0) && (
        <div
          className="
            border
            border-white/10
            bg-white/3
            p-4
          "
        >
          <div className="mb-3 flex justify-between text-sm">
            <span className="text-zinc-400">{status}</span>

            <span className="font-medium text-indigo-400">{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden bg-white/5">
            <div
              className="
                h-full
                bg-linear-to-r
                from-indigo-500
                to-indigo-400
                transition-all
                duration-300
              "
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          className="

            border
            border-red-500/20
            bg-red-500/10
            p-4
            text-sm
            text-red-300
          "
        >
          {error}
        </div>
      )}

      {data.length > 0 && (
        <>
          <article
            className="
            h-80
            overflow-y-auto
            overflow-x-hidden
            border
            border-white/10
            bg-white/2
            p-6
            backdrop-blur-sm
          "
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              {data[0].title}
            </h2>

            <p className="mt-2 break-all text-sm text-indigo-300">
              {data[0].url}
            </p>

            <ColoredText text={data[0].summarizedWebsite} variant="indigo" />
          </article>
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            <Metric label="Model" value={data[0].metrics.model} />
            <Metric label="Time" value={`${data[0].metrics.durationMs}ms`} />
            <Metric
              label="Prompt tokens"
              value={data[0].metrics.promptTokens ?? "N/A"}
            />
            <Metric
              label="Total tokens"
              value={data[0].metrics.totalTokens ?? "N/A"}
            />
          </div>
        </>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="

        border
        border-white/10
        bg-white/3
        p-4
      "
    >
      <p className="text-[11px] uppercase tracking-[0.2em] text-indigo-300">
        {label}
      </p>

      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}
