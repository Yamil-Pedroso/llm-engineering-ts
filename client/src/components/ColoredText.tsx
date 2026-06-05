type ColoredTextProps = {
  text: string;
  variant?: "indigo" | "emerald";
};

export function ColoredText({ text, variant = "indigo" }: ColoredTextProps) {
  const colors =
    variant === "indigo"
      ? [
          "text-indigo-300",
          "text-indigo-400",
          "text-indigo-500",
          "text-indigo-300",
        ]
      : [
          "text-emerald-300",
          "text-emerald-400",
          "text-emerald-500",
          "text-emerald-300",
        ];

  return (
    <p className="mt-6 whitespace-pre-wrap leading-8">
      {text.split(/\s+/).map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={colors[index % colors.length]}
        >
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
