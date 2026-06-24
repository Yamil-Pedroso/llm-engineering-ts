import { motion } from "framer-motion";
import type {
  CompressionStatus,
  QuantizationPrecision,
} from "../../types/quantization.types";

interface CompressionProgressProps {
  targetPrecision: QuantizationPrecision;
  progress: number;
  status: CompressionStatus;
  currentStep: string;
  onReset: () => void;
}

export function CompressionProgress({
  targetPrecision,
  progress,
  status,
  currentStep,
  onReset,
}: CompressionProgressProps) {
  const isComplete = status === "complete";

  return (
    <section className="border-t border-emerald-200 bg-slate-950 p-5 text-white sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Visual compression flow
          </p>
          <h3 className="mt-2 text-xl font-black">
            FP32 to {targetPrecision}
          </h3>
          <p className="mt-2 text-sm text-slate-300">{currentStep}</p>
        </div>
        <div className="flex items-center gap-4">
          <strong className="font-mono text-3xl">{progress}%</strong>
          <button
            type="button"
            onClick={onReset}
            className="min-h-10 rounded-lg border border-white/20 px-4 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Reset compression
          </button>
        </div>
      </div>

      <div
        className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-label={`Compression to ${targetPrecision}`}
      >
        <motion.div
          className="h-full rounded-full bg-emerald-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.12, ease: "linear" }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {isComplete
          ? "The backend analysis and educational animation are complete."
          : "The backend request and visual learning animation are running in parallel."}
      </p>
    </section>
  );
}
