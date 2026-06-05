import { ScrapedPageView } from "./components/ScrapedPageView";
import { OpenAISummaryView } from "./components/OpenAISummaryView";

const App = () => {
  return (
    <main className="min-h-screen px-6 py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 shadow-sm backdrop-blur">
            LLM Engineering Playground
          </p>

          <h1 className="mt-6 text-5xl font-semibold tracking-tight bg-[#fc5523] p-4 text-[#020202] sm:text-6xl">
            Website Scraping Systems
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Compare a traditional scraping workflow with an AI-powered OpenAI
            summarization pipeline side by side.
          </p>
        </div>

        <section className="grid w-full gap-8 xl:grid-cols-2 xl:items-start">
          <div className="relative overflow-hidden  shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
            <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative p-6">
              <ScrapedPageView />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative p-6">
              <OpenAISummaryView />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default App;
