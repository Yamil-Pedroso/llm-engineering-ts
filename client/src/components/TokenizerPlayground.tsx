import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTokenizer } from "../lib/hooks/useTokenizer";
import {
  formatEstimatedCost,
  formatTokenValue,
} from "../lib/tokenizerFormatters";
import type {
  TokenizerAnalysis,
  TokenizerModel,
  TokenType,
} from "../types/tokenizer.types";

const exampleText =
  "LLMs split text into tokens. Version 2 costs $19.99, and punctuation matters!";

const tokenStyles: Record<TokenType, string> = {
  word: "border-cyan-200 bg-cyan-50 text-cyan-950",
  number: "border-amber-200 bg-amber-50 text-amber-950",
  punctuation: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950",
  whitespace: "border-slate-300 bg-slate-100 text-slate-700",
  special: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

const tokenLabels: Record<TokenType, string> = {
  word: "Word",
  number: "Number",
  punctuation: "Punctuation",
  whitespace: "Whitespace",
  special: "Special",
};

const accuracyStyles = {
  exact: "border-emerald-200 bg-emerald-50 text-emerald-800",
  estimated: "border-amber-200 bg-amber-50 text-amber-800",
  educational: "border-cyan-200 bg-cyan-50 text-cyan-800",
} as const;

function buildInsights(data: TokenizerAnalysis): string[] {
  return [
    `${data.selectedModel.displayName} counted ${data.inputTokens} input tokens from ${data.wordCount} words.`,
    data.tokenizerAccuracy === "exact"
      ? "This model uses a compatible provider tokenizer locally."
      : "This model currently uses an explicit fallback estimate.",
    `${data.estimatedOutputTokens} output tokens are budgeted separately because generated text has its own price.`,
    `The configured conversion uses 1 USD = ${data.costEstimate.usdToChfRate} CHF.`,
  ];
}

function getProviders(models: TokenizerModel[]): string[] {
  return [...new Set(models.map((model) => model.provider))];
}

export function TokenizerPlayground() {
  const [text, setText] = useState(exampleText);
  const [provider, setProvider] = useState("OpenAI");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [estimatedOutputTokens, setEstimatedOutputTokens] = useState(500);
  const [includeSpaces, setIncludeSpaces] = useState(false);
  const {
    data,
    error,
    isLoading,
    models,
    modelsError,
    analyze,
    reset,
  } = useTokenizer();

  const providers = useMemo(() => getProviders(models), [models]);
  const providerModels = useMemo(
    () => models.filter((model) => model.provider === provider),
    [models, provider],
  );

  function handleProviderChange(nextProvider: string) {
    setProvider(nextProvider);
    const firstModel = models.find((model) => model.provider === nextProvider);

    if (firstModel) {
      setSelectedModel(firstModel.modelId);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void analyze({
      text,
      selectedModel,
      estimatedOutputTokens,
      includeSpaces,
    });
  }

  function handleClear() {
    setText("");
    reset();
  }

  return (
    <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
      <header className="border-b border-slate-200 px-5 py-7 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
          Provider-aware estimation
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="text-3xl font-black sm:text-4xl">
              Tokenizer Playground
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Compare tokenizer strategies and estimate separate input and
              output costs for a selected model.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Token type legend">
            {(Object.keys(tokenLabels) as TokenType[]).map((type) => (
              <span
                key={type}
                className={`rounded-md border px-2.5 py-1 text-xs font-bold ${tokenStyles[type]}`}
              >
                {tokenLabels[type]}
              </span>
            ))}
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="border-b border-slate-200 p-5 sm:p-8">
        <label className="grid gap-2 text-sm font-bold text-slate-800">
          Text to analyze
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={7}
            placeholder="Paste a prompt, paragraph, or document excerpt..."
            className="resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-sm font-normal leading-6 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/50"
          />
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_0.7fr_auto] xl:items-end">
          <label className="grid gap-2 text-sm font-bold text-slate-800">
            Provider
            <select
              value={provider}
              onChange={(event) => handleProviderChange(event.target.value)}
              disabled={models.length === 0}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/50"
            >
              {providers.map((providerName) => (
                <option key={providerName} value={providerName}>
                  {providerName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-800">
            Model
            <select
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              disabled={providerModels.length === 0}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/50"
            >
              {providerModels.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-800">
            Estimated output tokens
            <input
              type="number"
              min={0}
              max={1_000_000}
              step={1}
              value={estimatedOutputTokens}
              onChange={(event) =>
                setEstimatedOutputTokens(Number(event.target.value))
              }
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/50"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2 xl:flex">
            <button
              type="submit"
              disabled={isLoading || models.length === 0}
              className="min-h-11 rounded-lg bg-cyan-700 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(14,116,144,0.22)] transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Analyzing..." : "Analyze"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={includeSpaces}
            onChange={(event) => setIncludeSpaces(event.target.checked)}
            className="size-4 accent-cyan-700"
          />
          Show whitespace tokens when the selected adapter supports it
        </label>
      </form>

      {(error || modelsError) && (
        <p
          role="alert"
          className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-8"
        >
          {error ?? modelsError}
        </p>
      )}

      <div aria-live="polite">
        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-9 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Running tokenizer and pricing strategies...
              </p>
            </div>
          </div>
        ) : data ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid border-b border-slate-200 sm:grid-cols-4">
              {[
                ["Characters", data.characterCount],
                ["Words", data.wordCount],
                ["Input tokens", data.inputTokens],
                ["Output estimate", data.estimatedOutputTokens],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-slate-200 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:p-6"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {label}
                  </p>
                  <strong className="mt-2 block text-3xl font-black">
                    {value}
                  </strong>
                </div>
              ))}
            </div>

            <div className="grid xl:grid-cols-[1.25fr_0.75fr]">
              <div className="border-b border-slate-200 p-5 sm:p-8 xl:border-b-0 xl:border-r">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black">Token visualization</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {data.selectedModel.displayName} ·{" "}
                      {data.selectedModel.provider}
                    </p>
                  </div>
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-bold uppercase ${accuracyStyles[data.tokenizerAccuracy]}`}
                  >
                    {data.tokenizerAccuracy}
                  </span>
                </div>

                <p className="mt-3 rounded-lg bg-slate-100 p-3 text-xs leading-5 text-slate-600">
                  {data.tokenizerNotes}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  {data.tokens.map((token) => (
                    <article
                      key={token.id}
                      className={`min-w-24 rounded-lg border p-3 ${tokenStyles[token.type]}`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] font-bold uppercase">
                        <span>#{token.id}</span>
                        <span>{token.type}</span>
                      </div>
                      <p className="mt-2 break-all font-mono text-sm font-black">
                        {formatTokenValue(token.value, token.type)}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="bg-slate-950 p-5 text-white sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Cost estimate
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  {[
                    [
                      "Input cost",
                      formatEstimatedCost(
                        data.costEstimate.inputCostUSD,
                        "USD",
                      ),
                    ],
                    [
                      "Output cost",
                      formatEstimatedCost(
                        data.costEstimate.outputCostUSD,
                        "USD",
                      ),
                    ],
                    [
                      "Total USD",
                      formatEstimatedCost(
                        data.costEstimate.totalCostUSD,
                        "USD",
                      ),
                    ],
                    [
                      "Total CHF",
                      formatEstimatedCost(
                        data.costEstimate.totalCostCHF,
                        "CHF",
                      ),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="border-b border-white/10 pb-4 last:border-b-0"
                    >
                      <p className="text-xs font-bold uppercase text-slate-400">
                        {label}
                      </p>
                      <strong className="mt-1 block break-all font-mono text-xl">
                        {value}
                      </strong>
                    </div>
                  ))}
                </div>
              </aside>
            </div>

            <div className="grid border-t border-slate-200 lg:grid-cols-2">
              <div className="border-b border-slate-200 p-5 sm:p-8 lg:border-b-0 lg:border-r">
                <h3 className="text-lg font-black">Educational insights</h3>
                <div className="mt-4 grid gap-3">
                  {buildInsights(data).map((insight, index) => (
                    <div
                      key={insight}
                      className="grid grid-cols-[2rem_1fr] gap-3"
                    >
                      <span className="font-mono text-xs font-black text-cyan-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm leading-6 text-slate-600">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <h3 className="text-lg font-black">Pricing context</h3>
                <dl className="mt-4 grid gap-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Input / 1M</dt>
                    <dd className="font-mono font-bold">
                      {formatEstimatedCost(
                        data.selectedModel.inputPricePerMillionUSD,
                        "USD",
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Output / 1M</dt>
                    <dd className="font-mono font-bold">
                      {formatEstimatedCost(
                        data.selectedModel.outputPricePerMillionUSD,
                        "USD",
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Pricing updated</dt>
                    <dd className="font-semibold">
                      {data.selectedModel.pricingLastUpdated}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <aside className="border-t border-cyan-200 bg-cyan-50/70 p-5 sm:p-8">
              <div className="grid gap-5 lg:grid-cols-[0.35fr_0.65fr]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-800">
                    Educational disclaimer
                  </p>
                  <h3 className="mt-2 text-xl font-black text-slate-950">
                    Useful estimate, not a bill
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    This playground is designed to explain tokenization and
                    compare pricing models. Production billing must be based on
                    usage metadata returned by the provider after a real API
                    request.
                  </p>
                </div>

                <ul className="grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
                  <li className="border-l-2 border-cyan-500 pl-3">
                    OpenAI models use a compatible local{" "}
                    <strong>js-tiktoken</strong> encoding. Claude, Gemini, Llama,
                    and Hugging Face currently use clearly labeled fallback
                    estimates.
                  </li>
                  <li className="border-l-2 border-cyan-500 pl-3">
                    Input tokens are calculated by the selected tokenizer.
                    Output cost uses the expected token count entered above,
                    not an actual generated response.
                  </li>
                  <li className="border-l-2 border-cyan-500 pl-3">
                    Llama is open-weight, so its serving cost depends on the
                    hosting provider, hardware, and inference platform.
                  </li>
                  <li className="border-l-2 border-cyan-500 pl-3">
                    USD to CHF currently uses a fixed configured rate of{" "}
                    <strong>{data.costEstimate.usdToChfRate}</strong>. Model
                    prices and exchange rates can change over time.
                  </li>
                  <li className="border-l-2 border-cyan-500 pl-3 md:col-span-2">
                    Precise costs require official provider tokenization or API
                    usage metadata, current model pricing, current exchange
                    rates, and consideration of cached, reasoning, audio, image,
                    or other provider-specific tokens.
                  </li>
                </ul>
              </div>

              <p className="mt-5 border-t border-cyan-200 pt-4 text-xs leading-5 text-cyan-950">
                {data.disclaimer}
              </p>
            </aside>
          </motion.div>
        ) : (
          <div className="flex min-h-80 items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <p className="text-xl font-black">Choose a model and run an estimate</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                OpenAI models use compatible BPE tokenization. Other providers
                are clearly labeled when using fallback estimates.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
