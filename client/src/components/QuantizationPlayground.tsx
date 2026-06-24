import { useState } from "react";
import { motion } from "framer-motion";
import { useQuantization } from "../lib/hooks/useQuantization";
import { useCompressionFlow } from "../lib/hooks/useCompressionFlow";
import { CompressionProgress } from "./quantization/CompressionProgress";
import { QuantizedResultCard } from "./quantization/QuantizedResultCard";
import type {
  QuantizationPrecision,
  QuantizationResult,
} from "../types/quantization.types";

const defaultWeights = "0.123456, -0.987654, 1.234567, -2.456789";

const presets = [
  { label: "Small demo model", detail: "1M", parameterCount: 1_000_000 },
  { label: "Llama 3.1 8B", detail: "8B", parameterCount: 8_000_000_000 },
  { label: "Llama 3.1 70B", detail: "70B", parameterCount: 70_000_000_000 },
] as const;

const precisionStyles: Record<QuantizationPrecision, string> = {
  FP32: "border-slate-300 bg-slate-100 text-slate-900",
  FP16: "border-cyan-200 bg-cyan-50 text-cyan-950",
  INT8: "border-emerald-200 bg-emerald-50 text-emerald-950",
  INT4: "border-amber-200 bg-amber-50 text-amber-950",
  INT2: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950",
};

const compressionLabels: Partial<Record<QuantizationPrecision, string>> = {
  FP16: "Compress to FP16",
  INT8: "Compress to Q8",
  INT4: "Compress to Q4",
  INT2: "Compress to INT2",
};

function parseWeights(value: string): number[] | null {
  const parts = value
    .split(/[\s,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  const weights = parts.map(Number);
  return weights.every(Number.isFinite) ? weights : null;
}

function formatParameterCount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatSize(value: number): string {
  if (value >= 1) {
    return `${value.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })} GB`;
  }

  return `${(value * 1_000).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} MB`;
}

function formatError(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

function getModelName(parameterCount: number): string {
  return (
    presets.find((preset) => preset.parameterCount === parameterCount)?.label ??
    `${formatParameterCount(parameterCount)} model`
  );
}

function WeightPreview({ result }: { result: QuantizationResult }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {result.quantizedWeights.map((weight, index) => (
        <span
          key={`${result.precision}-${index}`}
          className="rounded-md border border-current/15 bg-white/70 px-2 py-1 font-mono text-xs font-bold"
        >
          {weight}
        </span>
      ))}
    </div>
  );
}

export function QuantizationPlayground() {
  const [weightsText, setWeightsText] = useState(defaultWeights);
  const [parameterCount, setParameterCount] = useState(8_000_000_000);
  const [inputError, setInputError] = useState<string | null>(null);
  const { data, error, isLoading, analyze, reset } = useQuantization();
  const compression = useCompressionFlow(analyze);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const weights = parseWeights(weightsText);

    if (!weights) {
      setInputError(
        "Enter at least one valid number separated by commas, spaces, or new lines.",
      );
      return;
    }

    setInputError(null);
    void analyze({ weights, parameterCount });
  }

  function handleClear() {
    setWeightsText("");
    setInputError(null);
    reset();
    compression.resetCompression();
  }

  function handleCompress(targetPrecision: QuantizationPrecision) {
    const weights = parseWeights(weightsText);

    if (!weights) {
      setInputError(
        "Enter at least one valid number separated by commas, spaces, or new lines.",
      );
      return;
    }

    setInputError(null);
    void compression.startCompression({
      request: { weights, parameterCount },
      targetPrecision,
      modelName: getModelName(parameterCount),
    });
  }

  return (
    <section className="mt-16 overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 text-slate-950 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
      <header className="border-b border-slate-200 px-5 py-7 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
          Model compression
        </p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="text-3xl font-black sm:text-4xl">
              Quantization Playground
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Simulate how lower numerical precision changes sample weights,
              model memory, and approximation error.
            </p>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Precision legend">
            {(Object.keys(precisionStyles) as QuantizationPrecision[]).map(
              (precision) => (
                <span
                  key={precision}
                  className={`rounded-md border px-2.5 py-1 text-xs font-black ${precisionStyles[precision]}`}
                >
                  {precision}
                </span>
              ),
            )}
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="border-b border-slate-200 p-5 sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.55fr]">
          <label className="grid gap-2 text-sm font-bold text-slate-800">
            Sample model weights
            <textarea
              value={weightsText}
              onChange={(event) => setWeightsText(event.target.value)}
              rows={6}
              placeholder="0.123456, -0.987654, 1.234567"
              className="resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-sm font-normal leading-6 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50"
            />
          </label>

          <div>
            <label className="grid gap-2 text-sm font-bold text-slate-800">
              Model parameter count
              <input
                type="number"
                min={1}
                step={1}
                value={parameterCount}
                onChange={(event) =>
                  setParameterCount(Number(event.target.value))
                }
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-normal outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200/50"
              />
            </label>

            <p className="mt-2 text-xs font-semibold text-slate-500">
              Current scale: {formatParameterCount(parameterCount)} parameters
            </p>

            <div className="mt-4 grid gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setParameterCount(preset.parameterCount)}
                  className="flex min-h-11 items-center justify-between rounded-lg border border-slate-300 bg-white px-3 text-left text-sm font-bold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <span>{preset.label}</span>
                  <span className="font-mono text-xs text-emerald-700">
                    {preset.detail}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {(inputError || error) && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {inputError ?? error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-11 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(4,120,87,0.2)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Quantizing..." : "Analyze quantization"}
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
      </form>

      <div aria-live="polite">
        {isLoading && !data ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto size-9 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-slate-600">
                Simulating precision formats...
              </p>
            </div>
          </div>
        ) : data ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid border-b border-slate-200 sm:grid-cols-3">
              {[
                ["Parameters", formatParameterCount(data.parameterCount)],
                ["Sample weights", data.originalWeights.length],
                ["FP32 baseline", formatSize(data.fp32EstimatedSizeGB)],
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

            <div className="p-5 sm:p-8">
              <h3 className="text-lg font-black">Precision cards</h3>
              <p className="mt-1 text-sm text-slate-500">
                Lower bit widths save memory but provide fewer representable
                values.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {data.results.map((result) => (
                  <article
                    key={result.precision}
                    className={`rounded-lg border p-4 ${precisionStyles[result.precision]}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xl font-black">
                          {result.precision}
                        </h4>
                        <p className="text-xs font-bold">
                          {result.bitsPerParameter} bits / parameter
                        </p>
                      </div>
                      <span className="rounded-md bg-white/70 px-2 py-1 text-xs font-black">
                        {result.memoryReductionPercentage === 0
                          ? "0%"
                          : `-${result.memoryReductionPercentage}%`}
                      </span>
                    </div>
                    <strong className="mt-5 block text-2xl font-black">
                      {formatSize(result.estimatedSizeGB)}
                    </strong>
                    <p className="mt-1 text-xs">
                      Avg. error: {formatError(result.averageAbsoluteError)}
                    </p>
                    <WeightPreview result={result} />
                    {compressionLabels[result.precision] && (
                      <button
                        type="button"
                        onClick={() => handleCompress(result.precision)}
                        disabled={compression.status === "compressing"}
                        className="mt-4 min-h-10 w-full rounded-lg bg-slate-950 px-3 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {compression.selectedTarget === result.precision &&
                        compression.status === "compressing"
                          ? "Compressing..."
                          : compressionLabels[result.precision]}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </div>

            {compression.selectedTarget && (
              <CompressionProgress
                targetPrecision={compression.selectedTarget}
                progress={compression.progress}
                status={compression.status}
                currentStep={compression.currentStep}
                onReset={compression.resetCompression}
              />
            )}

            {compression.result && (
              <QuantizedResultCard result={compression.result} />
            )}

            <div className="border-t border-slate-200 p-5 sm:p-8">
              <h3 className="text-lg font-black">Comparison table</h3>
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Precision</th>
                      <th className="px-4 py-3">Bits</th>
                      <th className="px-4 py-3">Estimated size</th>
                      <th className="px-4 py-3">Memory saved</th>
                      <th className="px-4 py-3">Average error</th>
                      <th className="px-4 py-3">Sample weights</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((result) => (
                      <tr
                        key={result.precision}
                        className="border-t border-slate-200 bg-white align-top"
                      >
                        <td className="px-4 py-3 font-black">
                          {result.precision}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {result.bitsPerParameter}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {formatSize(result.estimatedSizeGB)}
                        </td>
                        <td className="px-4 py-3">
                          {result.memoryReductionPercentage}%
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {formatError(result.averageAbsoluteError)}
                        </td>
                        <td className="max-w-md px-4 py-3 font-mono text-xs leading-5">
                          {result.quantizedWeights.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="grid border-t border-emerald-200 bg-emerald-50/70 lg:grid-cols-[0.4fr_0.6fr]">
              <div className="border-b border-emerald-200 p-5 sm:p-8 lg:border-b-0 lg:border-r">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                  Educational guide
                </p>
                <h3 className="mt-2 text-xl font-black">
                  Fewer bits, smaller model
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Quantization reduces the number of bits used to store model
                  weights. Compact weights need less RAM or VRAM, but rounding
                  them to fewer values introduces approximation error.
                </p>
              </div>

              <div className="p-5 sm:p-8">
                <ul className="grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
                  <li className="border-l-2 border-emerald-500 pl-3">
                    FP16 and INT8 often preserve more detail while reducing
                    memory compared with FP32.
                  </li>
                  <li className="border-l-2 border-emerald-500 pl-3">
                    Q4, Q5, and Q8 variants are common when running local LLMs
                    through GGUF, llama.cpp, or Ollama.
                  </li>
                  <li className="border-l-2 border-emerald-500 pl-3">
                    Real quantizers may operate per tensor, channel, or block
                    and store additional scales and zero points.
                  </li>
                  <li className="border-l-2 border-emerald-500 pl-3">
                    Smaller files do not guarantee identical model quality or
                    faster inference on every device.
                  </li>
                </ul>
                <p className="mt-5 border-t border-emerald-200 pt-4 text-xs leading-5 text-emerald-950">
                  {data.disclaimer} This playground does not create or modify a
                  real model file. The compression animation is a visual
                  learning aid; production quantization uses tools and formats
                  such as GGUF, llama.cpp, GPTQ, AWQ, bitsandbytes, and
                  Ollama-compatible model files.
                </p>
              </div>
            </aside>
          </motion.div>
        ) : (
          <div className="flex min-h-80 items-center justify-center p-8 text-center">
            <div className="max-w-md">
              <p className="text-xl font-black">
                Ready for a weight sample
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose a model scale and analyze sample weights to compare
                precision, memory, and approximation error.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
