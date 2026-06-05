import { motion } from "framer-motion";
import { ScrapedPageView } from "./components/ScrapedPageView";
import { OpenAISummaryView } from "./components/OpenAISummaryView";
import { Toaster } from "sonner";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.15,
    },
  },
} as const;

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 42,
    filter: "blur(10px)",
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
} as const;

const App = () => {
  return (
    <>
      <Toaster position="bottom-left" richColors />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="min-h-screen px-6 py-12 text-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col">
          <motion.div
            variants={itemVariants}
            className="mx-auto mb-16 max-w-4xl text-center"
          >
            <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 shadow-sm backdrop-blur">
              LLM Engineering Playground
            </p>

            <h1 className="mt-6 bg-[#fc5523] p-4 text-5xl font-semibold tracking-tight text-[#020202] sm:text-6xl">
              Website Scraping Systems
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Compare a traditional scraping workflow with an AI-powered OpenAI
              summarization pipeline side by side.
            </p>
          </motion.div>

          <section className="grid w-full gap-8 xl:grid-cols-2 xl:items-start">
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
              <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />

              <div className="relative p-6">
                <ScrapedPageView />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
              <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

              <div className="relative p-6">
                <OpenAISummaryView />
              </div>
            </motion.div>
          </section>
        </div>
      </motion.main>
    </>
  );
};

export default App;
