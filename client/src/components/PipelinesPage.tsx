import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePipelines } from "../lib/hooks/usePipelines";
import type { ClassificationType, PipelineResponse } from "../services/pipelinesService";

type PipelineId =
  | "question-answering"
  | "summarization"
  | "translation"
  | "classification"
  | "text-generation"
  | "audio-generation";

type PipelineCard = {
  id: PipelineId;
  name: string;
  description: string;
};

const pipelineCards: PipelineCard[] = [
  {
    id: "question-answering",
    name: "Question Answering",
    description: "Ask a question against a supplied context.",
  },
  {
    id: "summarization",
    name: "Summarization",
    description: "Turn long text into a compact summary.",
  },
  {
    id: "translation",
    name: "Translation",
    description: "Translate text between language codes.",
  },
  {
    id: "classification",
    name: "Classification",
    description: "Run sentiment or future text classification tasks.",
  },
  {
    id: "text-generation",
    name: "Text Generation",
    description: "Generate text from a prompt and decoding options.",
  },
  {
    id: "audio-generation",
    name: "Audio Generation",
    description: "Prepare text-to-speech output through a provider.",
  },
];

function resultText(result: PipelineResponse | null) {
  if (!result) return "";
  if ("answer" in result) return result.answer;
  if ("summary" in result) return result.summary;
  if ("translation" in result) return result.translation;
  if ("label" in result) return `${result.label} (${Math.round(result.score * 100)}%)`;
  if ("generatedText" in result) return result.generatedText;
  return result.audioUrl ?? result.message;
}

export function PipelinesPage() {
  const [activePipeline, setActivePipeline] =
    useState<PipelineId>("question-answering");
  const [question, setQuestion] = useState("Who created React?");
  const [context, setContext] = useState(
    "React was created by Facebook and Jordan Walke.",
  );
  const [summaryText, setSummaryText] = useState(
    "Pipelines are high-level APIs for common machine learning tasks. They make it easier to run inference for question answering, summarization, translation, classification, generation, and audio workflows.",
  );
  const [translationText, setTranslationText] = useState("Hello world");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [classificationText, setClassificationText] = useState(
    "I love programming.",
  );
  const [classificationType, setClassificationType] =
    useState<ClassificationType>("sentiment-analysis");
  const [prompt, setPrompt] = useState("Explain what a Transformer model is.");
  const [temperature, setTemperature] = useState(0.7);
  const [maxNewTokens, setMaxNewTokens] = useState(200);
  const [topP, setTopP] = useState(0.95);
  const [audioText, setAudioText] = useState("Welcome to my application.");
  const [copied, setCopied] = useState(false);

  const {
    result,
    loading,
    error,
    clear,
    questionAnswering,
    summarize,
    translate,
    classify,
    generateText,
    generateAudio,
  } = usePipelines();

  const activeCard = useMemo(
    () => pipelineCards.find((card) => card.id === activePipeline),
    [activePipeline],
  );

  function runSelectedPipeline(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopied(false);

    if (activePipeline === "question-answering") {
      questionAnswering({ question, context });
      return;
    }

    if (activePipeline === "summarization") {
      summarize({ text: summaryText });
      return;
    }

    if (activePipeline === "translation") {
      translate({ text: translationText, sourceLanguage, targetLanguage });
      return;
    }

    if (activePipeline === "classification") {
      classify({ text: classificationText, classificationType });
      return;
    }

    if (activePipeline === "text-generation") {
      generateText({ prompt, temperature, maxNewTokens, topP });
      return;
    }

    generateAudio({ text: audioText, format: "mp3" });
  }

  async function copyResult() {
    await navigator.clipboard.writeText(resultText(result));
    setCopied(true);
  }

  function clearPanel() {
    clear();
    setCopied(false);
  }

  return (
    <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-5 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:p-7">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
            Hugging Face pipelines
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            Pipelines Page
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Choose a task, send typed input to the backend, and inspect a clean provider-ready response.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {pipelineCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setActivePipeline(card.id);
                  clearPanel();
                }}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  activePipeline === card.id
                    ? "border-indigo-300 bg-indigo-50 text-indigo-950 shadow-sm"
                    : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                }`}
              >
                <span className="block text-sm font-black">{card.name}</span>
                <span className="mt-1 block text-xs leading-5">
                  {card.description}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={runSelectedPipeline} className="mt-6 grid gap-4">
            <p className="text-sm font-semibold text-slate-600">
              {activeCard?.description}
            </p>

            {activePipeline === "question-answering" && (
              <>
                <TextInput label="Question" value={question} onChange={setQuestion} />
                <TextArea label="Context" value={context} onChange={setContext} rows={5} />
              </>
            )}

            {activePipeline === "summarization" && (
              <TextArea label="Text" value={summaryText} onChange={setSummaryText} rows={7} />
            )}

            {activePipeline === "translation" && (
              <>
                <TextArea label="Text" value={translationText} onChange={setTranslationText} rows={4} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput label="Source language" value={sourceLanguage} onChange={setSourceLanguage} />
                  <TextInput label="Target language" value={targetLanguage} onChange={setTargetLanguage} />
                </div>
              </>
            )}

            {activePipeline === "classification" && (
              <>
                <TextArea label="Text" value={classificationText} onChange={setClassificationText} rows={4} />
                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Classification type
                  <select
                    value={classificationType}
                    onChange={(event) =>
                      setClassificationType(event.target.value as ClassificationType)
                    }
                    className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-300/20"
                  >
                    <option value="sentiment-analysis">sentiment-analysis</option>
                    <option value="zero-shot-classification">zero-shot-classification</option>
                    <option value="text-classification">text-classification</option>
                  </select>
                </label>
              </>
            )}

            {activePipeline === "text-generation" && (
              <>
                <TextArea label="Prompt" value={prompt} onChange={setPrompt} rows={5} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <NumberInput label="Temperature" value={temperature} onChange={setTemperature} step={0.1} />
                  <NumberInput label="Max new tokens" value={maxNewTokens} onChange={setMaxNewTokens} />
                  <NumberInput label="Top P" value={topP} onChange={setTopP} step={0.05} />
                </div>
              </>
            )}

            {activePipeline === "audio-generation" && (
              <TextArea label="Text" value={audioText} onChange={setAudioText} rows={5} />
            )}

            {error && (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={loading}
                className="min-h-11 rounded-full bg-indigo-700 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(67,56,202,0.24)] transition hover:-translate-y-0.5 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? "Running pipeline..." : "Run pipeline"}
              </button>
              <button
                type="button"
                onClick={clearPanel}
                className="min-h-11 rounded-full border border-slate-200 bg-white/80 px-5 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <ResultPanel result={result} copied={copied} onCopy={copyResult} />
      </div>
    </section>
  );
}

function ResultPanel({
  result,
  copied,
  onCopy,
}: {
  result: PipelineResponse | null;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-inner sm:p-5">
      {!result ? (
        <div className="flex h-full min-h-[520px] items-center justify-center text-center text-sm leading-6 text-slate-400">
          Pick a pipeline and run it to see the output here.
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">
              Result
            </p>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/15"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">
              {resultText(result)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Provider" value={result.meta.provider} />
            <Metric label="Model" value={result.meta.model} />
            <Metric label="Duration" value={`${result.meta.durationMs}ms`} />
          </div>

          <pre className="max-h-80 overflow-auto rounded-2xl bg-black/30 p-4 text-xs leading-5 text-indigo-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-300/20"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="resize-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-300/20"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        type="number"
        value={value}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-300/20"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}
