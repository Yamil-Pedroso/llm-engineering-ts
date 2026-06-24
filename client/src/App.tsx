import { motion } from "framer-motion";
import { ScrapedPageView } from "./components/ScrapedPageView";
import { OpenAISummaryView } from "./components/OpenAISummaryView";
import { AiSdkExamples } from "./components/AiSdkExamples";
import { ToolPlannerView } from "./components/ToolPlannerView";
import { FlightTicketsView } from "./components/FlightTicketsView";
import { PipelinesPage } from "./components/PipelinesPage";
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
        className="relative min-h-screen overflow-hidden bg-[#f4f0ea] px-6 py-12 text-slate-950"
      >
        <div className="relative mx-auto flex max-w-7xl flex-col">
          <motion.div
            variants={itemVariants}
            className="mx-auto mb-16 max-w-4xl text-center"
          >
            <p className="inline-flex rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur-2xl">
              LLM Engineering Playground
            </p>

            <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-8xl">
              <span className="block text-slate-950">WEB SCRAPING</span>

              <span className="block bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                WITH AI
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500">
              Compare a traditional scraping workflow with an AI-powered OpenAI
              summarization pipeline side by side.
            </p>
          </motion.div>

          <section className="grid w-full gap-8 xl:grid-cols-2 xl:items-start">
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl"
            >
              <div className="relative p-5 sm:p-6 bg-[#111111]">
                <ScrapedPageView />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl"
            >
              <div className="relative p-5 sm:p-6 bg-[#111111]">
                <OpenAISummaryView />
              </div>
            </motion.div>
          </section>

          <motion.div variants={itemVariants}>
            <AiSdkExamples />
          </motion.div>

          <motion.div variants={itemVariants}>
            <ToolPlannerView />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FlightTicketsView />
          </motion.div>

          <motion.div variants={itemVariants}>
            <PipelinesPage />
          </motion.div>
        </div>
      </motion.main>
    </>
  );
};

export default App;
