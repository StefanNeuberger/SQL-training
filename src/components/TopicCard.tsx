import Link from "next/link";
import { ProgressBar } from "./ProgressBar";
import { LevelBadge } from "./LevelBadge";
import { CheckCircle, ChevronRight } from "lucide-react";

interface TopicCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  totalCount: number;
  completedCount: number;
}

const levelColor: Record<string, "emerald" | "blue" | "purple"> = {
  beginner: "emerald",
  intermediate: "blue",
  advanced: "purple",
};

export function TopicCard({
  name,
  slug,
  description,
  level,
  totalCount,
  completedCount,
}: TopicCardProps) {
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isComplete = completedCount === totalCount && totalCount > 0;
  const color = levelColor[level];

  return (
    <Link href={`/topics/${slug}`}>
      <div className="group relative rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-neutral-600 transition-all duration-200 hover:bg-neutral-800/50">
        {isComplete && (
          <div className="absolute right-4 top-4">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
        )}
        <div className="mb-3 flex items-start justify-between pr-6">
          <div>
            <LevelBadge level={level} size="sm" />
            <h3 className="mt-2 font-semibold text-white group-hover:text-blue-300 transition-colors">
              {name}
            </h3>
          </div>
        </div>
        <p className="mb-4 text-sm text-neutral-400 line-clamp-2">{description}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>
              {completedCount}/{totalCount} challenges
            </span>
            <span>{percentage}%</span>
          </div>
          <ProgressBar value={percentage} color={color} size="sm" />
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View challenges</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}
