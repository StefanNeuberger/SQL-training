interface LevelBadgeProps {
  level: "beginner" | "intermediate" | "advanced";
  size?: "sm" | "md";
}

const config = {
  beginner: {
    label: "Beginner",
    className: "bg-emerald-950 text-emerald-400 border-emerald-800",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-blue-950 text-blue-400 border-blue-800",
  },
  advanced: {
    label: "Advanced",
    className: "bg-purple-950 text-purple-400 border-purple-800",
  },
};

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  const { label, className } = config[level];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 font-medium ${
        size === "sm" ? "py-0.5 text-xs" : "py-1 text-xs"
      } ${className}`}
    >
      {label}
    </span>
  );
}
