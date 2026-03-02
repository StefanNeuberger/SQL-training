import Link from "next/link";
import { CheckCircle, Circle, Lock } from "lucide-react";

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  topicName: string;
  isCompleted: boolean;
  isLocked?: boolean;
}

function DifficultyDots({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < difficulty ? "bg-blue-400" : "bg-neutral-700"
          }`}
        />
      ))}
    </div>
  );
}

export function ChallengeCard({
  id,
  title,
  description,
  difficulty,
  topicName,
  isCompleted,
  isLocked = false,
}: ChallengeCardProps) {
  const content = (
    <div
      className={`group rounded-lg border p-4 transition-all duration-200 ${
        isLocked
          ? "cursor-not-allowed border-neutral-800 bg-neutral-900/50 opacity-50"
          : isCompleted
          ? "border-emerald-800/50 bg-emerald-950/20 hover:border-emerald-700 hover:bg-emerald-950/30"
          : "border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-800/50 cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs text-neutral-500">{topicName}</span>
          </div>
          <h3
            className={`font-medium truncate ${
              isCompleted ? "text-emerald-300" : "text-white"
            } ${!isLocked && "group-hover:text-blue-300"} transition-colors`}
          >
            {title}
          </h3>
          <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{description}</p>
        </div>
        <div className="shrink-0">
          {isLocked ? (
            <Lock className="h-4 w-4 text-neutral-600" />
          ) : isCompleted ? (
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          ) : (
            <Circle className="h-5 w-5 text-neutral-600 group-hover:text-blue-400 transition-colors" />
          )}
        </div>
      </div>
      <div className="mt-3">
        <DifficultyDots difficulty={difficulty} />
      </div>
    </div>
  );

  if (isLocked) return content;

  return <Link href={`/challenges/${id}`}>{content}</Link>;
}
