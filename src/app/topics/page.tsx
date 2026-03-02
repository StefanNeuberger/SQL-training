"use client";

import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { useUser } from "@/hooks/useUser";
import { trpc } from "@/lib/trpc/client";
import { LevelBadge } from "@/components/LevelBadge";

const LEVELS = [
  { key: "beginner" as const, label: "Beginner" },
  { key: "intermediate" as const, label: "Intermediate" },
  { key: "advanced" as const, label: "Advanced" },
];

function TopicsContent({ userId }: { userId: string }) {
  const { data: topics, isLoading } = trpc.topics.getWithProgress.useQuery({
    userId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-400" />
      </div>
    );
  }

  if (!topics?.length) {
    return (
      <div className="py-10 text-center text-neutral-500">No topics found.</div>
    );
  }

  return (
    <div className="space-y-10">
      {LEVELS.map((level) => {
        const levelTopics = topics.filter((t) => t.level === level.key);
        if (!levelTopics.length) return null;

        return (
          <section key={level.key}>
            <div className="mb-4 flex items-center gap-3">
              <LevelBadge level={level.key} />
              <span className="text-sm text-neutral-500">
                {levelTopics.length} topics
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {levelTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  id={topic.id}
                  name={topic.name}
                  slug={topic.slug}
                  description={topic.description}
                  level={topic.level}
                  totalCount={topic.totalCount}
                  completedCount={topic.completedCount}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function TopicsPage() {
  const { userId } = useUser();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Browse Topics</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Practice SQL concepts by topic — from SELECT basics to window functions
          </p>
        </div>
        {userId && <TopicsContent userId={userId} />}
      </div>
    </AppShell>
  );
}
