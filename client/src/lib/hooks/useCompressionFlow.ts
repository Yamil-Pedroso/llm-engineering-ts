import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CompressionResult,
  CompressionStatus,
  QuantizationAnalysis,
  QuantizationAnalyzeRequest,
  QuantizationPrecision,
} from "../../types/quantization.types";

const compressionSteps = [
  "Reading model weights...",
  "Mapping FP32 values...",
  "Reducing precision...",
  "Calculating approximation error...",
  "Generating quantized representation...",
  "Compression complete.",
] as const;

const ANIMATION_DURATION_MS = 3_000;
const FRAME_INTERVAL_MS = 50;

interface CompressionRequest {
  request: QuantizationAnalyzeRequest;
  targetPrecision: QuantizationPrecision;
  modelName: string;
}

type AnalyzeFunction = (
  input: QuantizationAnalyzeRequest,
) => Promise<QuantizationAnalysis | null>;

export function useCompressionFlow(analyze: AnalyzeFunction) {
  const [selectedTarget, setSelectedTarget] =
    useState<QuantizationPrecision | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<CompressionStatus>("idle");
  const [currentStep, setCurrentStep] = useState<string>(
    compressionSteps[0],
  );
  const [result, setResult] = useState<CompressionResult | null>(null);
  const intervalRef = useRef<number | null>(null);
  const resolveAnimationRef = useRef<(() => void) | null>(null);
  const runIdRef = useRef(0);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    resolveAnimationRef.current?.();
    resolveAnimationRef.current = null;
  }, []);

  useEffect(() => stopAnimation, [stopAnimation]);

  const animateCompression = useCallback(() => {
    stopAnimation();

    return new Promise<void>((resolve) => {
      const startedAt = Date.now();
      resolveAnimationRef.current = resolve;

      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const nextProgress = Math.min(
          100,
          Math.round((elapsed / ANIMATION_DURATION_MS) * 100),
        );
        const stepIndex = Math.min(
          compressionSteps.length - 1,
          Math.floor(
            (nextProgress / 100) * compressionSteps.length,
          ),
        );

        setProgress(nextProgress);
        setCurrentStep(compressionSteps[stepIndex]);

        if (nextProgress >= 100) {
          stopAnimation();
          resolve();
        }
      }, FRAME_INTERVAL_MS);
    });
  }, [stopAnimation]);

  const startCompression = useCallback(
    async ({
      request,
      targetPrecision,
      modelName,
    }: CompressionRequest) => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      setSelectedTarget(targetPrecision);
      setProgress(0);
      setCurrentStep(compressionSteps[0]);
      setStatus("compressing");
      setResult(null);

      const [analysis] = await Promise.all([
        analyze(request),
        animateCompression(),
      ]);

      if (runId !== runIdRef.current) {
        return null;
      }

      if (!analysis) {
        setStatus("idle");
        return null;
      }

      const original = analysis.results.find(
        (item) => item.precision === "FP32",
      );
      const compressed = analysis.results.find(
        (item) => item.precision === targetPrecision,
      );

      if (!original || !compressed) {
        setStatus("idle");
        return null;
      }

      const compressionResult = {
        modelName,
        original,
        compressed,
      };

      setCurrentStep(compressionSteps[compressionSteps.length - 1]);
      setProgress(100);
      setStatus("complete");
      setResult(compressionResult);
      return compressionResult;
    },
    [analyze, animateCompression],
  );

  const resetCompression = useCallback(() => {
    runIdRef.current += 1;
    stopAnimation();
    setSelectedTarget(null);
    setProgress(0);
    setStatus("idle");
    setCurrentStep(compressionSteps[0]);
    setResult(null);
  }, [stopAnimation]);

  return {
    selectedTarget,
    progress,
    status,
    currentStep,
    result,
    startCompression,
    resetCompression,
  };
}
