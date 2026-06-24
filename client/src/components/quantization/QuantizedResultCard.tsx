import { motion } from "framer-motion";
import type { CompressionResult } from "../../types/quantization.types";

interface QuantizedResultCardProps {
  result: CompressionResult;
}

function formatSize(value: number): string {
  return value >= 1
    ? `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })} GB`
    : `${(value * 1_000).toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })} MB`;
}

function formatError(value: number): string {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 8,
  });
}

export function QuantizedResultCard({
  result,
}: QuantizedResultCardProps) {
  const compressionRatio =
    result.original.bitsPerParameter / result.compressed.bitsPerParameter;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-emerald-200 bg-emerald-50/70 p-5 sm:p-8"
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
            Compressed model result
          </p>
          <h3 className="mt-2 text-2xl font-black">
            {result.modelName} {result.compressed.precision}
          </h3>
        </div>
        <span className="w-fit rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-sm font-black text-emerald-800">
          {compressionRatio}x smaller
        </span>
      </div>

      <div className="mt-6 grid overflow-hidden rounded-lg border border-emerald-200 bg-white lg:grid-cols-2">
        <div className="border-b border-emerald-200 p-5 lg:border-b-0 lg:border-r">
          <p className="text-xs font-bold uppercase text-slate-500">Before</p>
          <h4 className="mt-2 text-xl font-black">
            {result.modelName} FP32
          </h4>
          <p className="mt-3 text-3xl font-black">
            {formatSize(result.original.estimatedSizeGB)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Large memory usage · High precision
          </p>
        </div>

        <div className="p-5">
          <p className="text-xs font-bold uppercase text-emerald-700">After</p>
          <h4 className="mt-2 text-xl font-black">
            {result.modelName} {result.compressed.precision}
          </h4>
          <p className="mt-3 text-3xl font-black text-emerald-800">
            {formatSize(result.compressed.estimatedSizeGB)}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Lower memory usage · Approximation error{" "}
            {formatError(result.compressed.averageAbsoluteError)}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-200 bg-white p-4">
          <dt className="text-xs font-bold uppercase text-slate-500">
            Memory saved
          </dt>
          <dd className="mt-1 text-2xl font-black">
            {result.compressed.memoryReductionPercentage}%
          </dd>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-white p-4">
          <dt className="text-xs font-bold uppercase text-slate-500">
            Compression ratio
          </dt>
          <dd className="mt-1 text-2xl font-black">
            {compressionRatio}x
          </dd>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-white p-4">
          <dt className="text-xs font-bold uppercase text-slate-500">
            Average error
          </dt>
          <dd className="mt-1 font-mono text-lg font-black">
            {formatError(result.compressed.averageAbsoluteError)}
          </dd>
        </div>
      </dl>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase text-slate-500">
          Quantized sample weights
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {result.compressed.quantizedWeights.map((weight, index) => (
            <span
              key={`${result.compressed.precision}-${index}`}
              className="rounded-md border border-emerald-200 bg-white px-2.5 py-1 font-mono text-xs font-bold"
            >
              {weight}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
