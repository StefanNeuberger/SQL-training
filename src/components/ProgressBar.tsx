interface ProgressBarProps {
  value: number; // 0-100
  color?: "emerald" | "blue" | "purple" | "neutral";
  showLabel?: boolean;
  size?: "sm" | "md";
}

const colorMap = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  neutral: "bg-neutral-400",
};

export function ProgressBar({
  value,
  color = "neutral",
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={`flex-1 overflow-hidden rounded-full bg-neutral-800 ${
          size === "sm" ? "h-1.5" : "h-2"
        }`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorMap[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-neutral-400 w-8 text-right">{clamped}%</span>
      )}
    </div>
  );
}
