import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion } from "framer-motion";
import apiClient from "../api/apiClient";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:3010/api/v1";

type StructuredBrief = {
  title: string;
  summary: string;
  audience: string;
  keyPoints: string[];
  nextExperiment: string;
};

type StructuredBriefResponse = {
  brief: StructuredBrief;
  metrics: {
    model: string;
    inputTokens: number | undefined;
    outputTokens: number | undefined;
    totalTokens: number | undefined;
  };
};

type SpeechResponse = {
  audio: string;
  mediaType: string;
  format: string;
  metrics: {
    model: string;
    voice: string;
  };
};

const cardBase =
  " rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl";

const fieldBase =
  "rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-sm text-slate-800 shadow-inner outline-none placeholder:text-slate-400 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-300/20";

const buttonBase =
  "min-h-11 rounded-full px-5 text-sm font-semibold shadow-[0_10px_22px_rgba(15,118,110,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

export function AiSdkExamples() {
  return (
    <section className="relative mt-20 overflow-hidden rounded-[2.5rem] px-4 py-12 text-slate-950 sm:px-6 lg:px-10">
      <h1 className="relative text-center text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
        <span className="block text-slate-950">MULTIMODAL</span>
        <span className="block ">AI SDK DEMOS</span>
      </h1>

      <div className="relative mt-12 grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StreamingTutorExample />
        <StructuredBriefExample />
        <ToolCallingExample />
        <SpeechExample />
      </div>
    </section>
  );
}

function StreamingTutorExample() {
  const [input, setInput] = useState(
    "Explain streaming responses in LLM apps.",
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${apiBaseUrl}/ai-sdk/chat`,
      }),
    [],
  );

  const { messages, sendMessage, status, error, stop } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <ExamplePanel
      accent="cyan"
      title="Streaming tutor"
      description="Watch the response arrive progressively."
    >
      <div className="flex h-full flex-col">
        <ChatTranscript
          messages={messages}
          empty="Ask a question and watch the response stream in."
        />

        {error && <ErrorText message={error.message} />}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-1 flex-col gap-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className={`${fieldBase} resize-none`}
          />

          <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
            <button
              type="submit"
              disabled={busy}
              className={`${buttonBase} flex-1 bg-[#3d6b71] text-white hover:bg-[#659399]`}
            >
              {busy ? "Streaming..." : "Send"}
            </button>

            {busy && (
              <button
                type="button"
                onClick={stop}
                className={`${buttonBase} border border-slate-200 bg-white/70 text-slate-700 hover:bg-white`}
              >
                Stop
              </button>
            )}
          </div>
        </form>
      </div>
    </ExamplePanel>
  );
}

function StructuredBriefExample() {
  const [topic, setTopic] = useState("RAG versus fine-tuning");
  const [data, setData] = useState<StructuredBriefResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<StructuredBriefResponse>(
        "/ai-sdk/structured-brief",
        { topic },
      );
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate brief");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ExamplePanel
      accent="amber"
      title="Structured output"
      description="Generate a clean JSON brief."
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col gap-3">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className={fieldBase}
        />

        {error && <ErrorText message={error} />}

        {data && (
          <div className="mt-1 max-h-72 overflow-y-auto overflow-x-hidden rounded-[1.75rem] border border-white/70 bg-white/65 p-5 shadow-inner sm:max-h-80 xl:max-h-60">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
              {data.brief.audience}
            </p>

            <h3 className="mt-2 text-lg font-black leading-7 text-slate-950 sm:text-xl">
              {data.brief.title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {data.brief.summary}
            </p>

            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {data.brief.keyPoints.map((point) => (
                <li
                  key={point}
                  className="rounded-2xl border border-orange-100 bg-orange-50/70 px-3 py-2"
                >
                  {point}
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm font-semibold text-emerald-700">
              Next: {data.brief.nextExperiment}
            </p>

            <p className="mt-4 break-words text-xs text-slate-400">
              {data.metrics.model} · {data.metrics.totalTokens ?? "N/A"} tokens
            </p>
          </div>
        )}

        <button
          disabled={loading}
          className={`${buttonBase} mt-auto bg-orange-400 text-white hover:bg-orange-300`}
        >
          {loading ? "Generating..." : "Generate JSON brief"}
        </button>
      </form>
    </ExamplePanel>
  );
}

function ToolCallingExample() {
  const [input, setInput] = useState(
    "I am visiting Zurich tomorrow. Should I plan indoor or outdoor work?",
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${apiBaseUrl}/ai-sdk/tool-chat`,
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <ExamplePanel
      accent="fuchsia"
      title="Tool calling"
      description="Ask questions that need external tools."
    >
      <div className="flex h-full flex-col">
        <ChatTranscript
          messages={messages}
          empty="Ask for planning advice that depends on weather."
        />

        {error && <ErrorText message={error.message} />}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-1 flex-col gap-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            className={`${fieldBase} resize-none`}
          />

          <button
            disabled={busy}
            className={`${buttonBase} mt-auto bg-[#523e80] text-white hover:bg-[#655a7e]`}
          >
            {busy ? "Thinking..." : "Ask with tool"}
          </button>
        </form>
      </div>
    </ExamplePanel>
  );
}

function SpeechExample() {
  const [text, setText] = useState(
    "AI SDK speech generation turns text into audio from a backend endpoint.",
  );
  const [voice, setVoice] = useState("alloy");
  const [instructions, setInstructions] = useState(
    "Speak clearly with a warm teaching tone.",
  );
  const [data, setData] = useState<SpeechResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await apiClient.post<SpeechResponse>("/ai-sdk/speech", {
        text,
        voice,
        instructions,
      });
      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate speech",
      );
    } finally {
      setLoading(false);
    }
  }

  const audioSrc = data
    ? `data:${data.mediaType};base64,${data.audio}`
    : undefined;

  return (
    <ExamplePanel
      accent="emerald"
      title="Speech"
      description="Turn your text into generated audio."
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className={`${fieldBase} resize-none`}
        />

        <select
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          className={fieldBase}
        >
          <option value="alloy">Alloy</option>
          <option value="ash">Ash</option>
          <option value="ballad">Ballad</option>
          <option value="coral">Coral</option>
          <option value="echo">Echo</option>
          <option value="sage">Sage</option>
          <option value="shimmer">Shimmer</option>
          <option value="verse">Verse</option>
        </select>

        <input
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className={fieldBase}
        />

        {error && <ErrorText message={error} />}

        {audioSrc && data && (
          <div className="mt-1 min-w-0 rounded-[1.75rem] border border-white/70 bg-white/65 p-4 shadow-inner">
            <audio controls src={audioSrc} className="w-full" />

            <p className="mt-3 break-words text-xs text-slate-400">
              {data.metrics.model} · {data.metrics.voice} · {data.format}
            </p>
          </div>
        )}

        <button
          disabled={loading}
          className={`${buttonBase} mt-auto bg-emerald-600 text-white hover:bg-emerald-500`}
        >
          {loading ? "Generating..." : "Generate speech"}
        </button>
      </form>
    </ExamplePanel>
  );
}

function ChatTranscript({
  messages,
  empty,
}: {
  messages: ReturnType<typeof useChat>["messages"];
  empty: string;
}) {
  return (
    <div
      className="
      h-[180px]
      overflow-y-auto
      rounded-[1.75rem]
      border border-white/70
      bg-white/65
      p-4
      shadow-inner
    "
    >
      {messages.length === 0 ? (
        <p className="text-sm text-slate-400">{empty}</p>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                {message.role}
              </p>

              <div className="mt-1 space-y-2 break-words text-sm leading-6 text-slate-700">
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return <p key={index}>{part.text}</p>;
                  }

                  return (
                    <pre
                      key={index}
                      className="
                        overflow-x-auto
                        whitespace-pre-wrap
                        rounded-2xl
                        border border-white/70
                        bg-slate-50/80
                        p-3
                        text-xs
                        text-slate-500
                      "
                    >
                      {JSON.stringify(part, null, 2)}
                    </pre>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function ExamplePanel({
  accent,
  title,
  description,
  children,
}: {
  accent: "cyan" | "amber" | "fuchsia" | "emerald";

  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const styles = {
    cyan: {
      badge: "bg-cyan-100 text-cyan-700",
      glow: "from-cyan-200/70 via-white/0 to-transparent",
    },
    amber: {
      badge: "bg-orange-100 text-orange-600",
      glow: "from-orange-300/70 via-white/0 to-transparent",
    },
    fuchsia: {
      badge: "bg-fuchsia-100 text-fuchsia-700",
      glow: "from-fuchsia-200/70 via-white/0 to-transparent",
    },
    emerald: {
      badge: "bg-emerald-100 text-emerald-700",
      glow: "from-emerald-300/70 via-white/0 to-transparent",
    },
  }[accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55 }}
      whileHover={{ y: -6 }}
      className={`${cardBase} relative flex h-full min-h-[550px] min-w-0 flex-col overflow-hidden p-5 sm:p-6 xl:p-5`}
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${styles.glow}`}
      />

      <div className="relative flex h-full flex-col">
        <h2 className="mt-4 text-2xl font-black leading-8 tracking-tight text-slate-950">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

        <div className="mt-5 flex flex-1 flex-col min-w-0">{children}</div>
      </div>
    </motion.article>
  );
}
function ErrorText({ message }: { message: string }) {
  return (
    <p className="mt-3 rounded-2xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-500">
      {message}
    </p>
  );
}
