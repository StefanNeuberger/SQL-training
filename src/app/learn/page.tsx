"use client";

import { AppShell } from "@/components/AppShell";
import { ChallengeCard } from "@/components/ChallengeCard";
import { LevelBadge } from "@/components/LevelBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { useUser } from "@/hooks/useUser";
import { trpc } from "@/lib/trpc/client";

const LEVELS = [
  { key: "beginner" as const, color: "emerald" as const },
  { key: "intermediate" as const, color: "blue" as const },
  { key: "advanced" as const, color: "purple" as const },
];

function LearnContent({ userId }: { userId: string }) {
  const { data: challenges, isLoading } =
    trpc.challenges.getOrderedWithProgress.useQuery({ userId });

  const { data: summary } = trpc.progress.getSummary.useQuery({ userId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-400" />
      </div>
    );
  }

  const grouped = LEVELS.map(({ key, color }) => {
    const levelChallenges = (challenges ?? []).filter(
      (c) => c.topic.level === key
    );
    const summaryItem = summary?.summary.find((s) => s.level === key);
    return { key, color, challenges: levelChallenges, summaryItem };
  });

  return (
    <div className="space-y-12">
      {grouped.map(({ key, color, challenges: levelChallenges, summaryItem }) => (
        <section key={key}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LevelBadge level={key} />
              <span className="text-sm text-neutral-500">
                {levelChallenges.length} challenges
              </span>
            </div>
            {summaryItem && (
              <div className="flex items-center gap-3">
                <ProgressBar
                  value={summaryItem.percentage}
                  color={color}
                  showLabel
                  size="sm"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            {levelChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                id={challenge.id}
                title={challenge.title}
                description={challenge.description}
                difficulty={challenge.difficulty}
                topicName={challenge.topic.name}
                isCompleted={!!challenge.progress?.completedAt}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default function LearnPage() {
  const { userId } = useUser();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Learning Path</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Work through challenges in order from beginner to advanced
          </p>
        </div>
        {userId && <LearnContent userId={userId} />}
      </div>
    </AppShell>
  );
}
