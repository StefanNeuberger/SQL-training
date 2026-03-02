"use client";

import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { ChallengeCard } from "@/components/ChallengeCard";
import { LevelBadge } from "@/components/LevelBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { useUser } from "@/hooks/useUser";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const levelColors: Record<string, "emerald" | "blue" | "purple"> = {
  beginner: "emerald",
  intermediate: "blue",
  advanced: "purple",
};

function TopicContent({
  slug,
  userId,
}: {
  slug: string;
  userId: string;
}) {
  const { data: topic, isLoading: topicLoading } = trpc.topics.getBySlug.useQuery({ slug });
  const { data: allProgress } = trpc.progress.getForUser.useQuery({ userId });

  if (topicLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-400" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="py-10 text-center text-neutral-500">Topic not found.</div>
    );
  }

  const completedIds = new Set(
    allProgress?.filter((p) => p.completedAt !== null).map((p) => p.challengeId)
  );

  const completedCount = topic.challenges.filter((c) => completedIds.has(c.id)).length;
  const percentage =
    topic.challenges.length > 0
      ? Math.round((completedCount / topic.challenges.length) * 100)
      : 0;

  return (
    <div>
      <Link
        href="/topics"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Topics
      </Link>

      <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <LevelBadge level={topic.level} />
            <h1 className="mt-2 text-xl font-bold text-white">{topic.name}</h1>
            <p className="mt-1 text-sm text-neutral-400">{topic.description}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-white">{percentage}%</div>
            <div className="text-xs text-neutral-500">
              {completedCount}/{topic.challenges.length}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={percentage}
            color={levelColors[topic.level]}
            showLabel={false}
          />
        </div>
      </div>

      <div className="space-y-3">
        {topic.challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            id={challenge.id}
            title={challenge.title}
            description={challenge.description}
            difficulty={challenge.difficulty}
            topicName={topic.name}
            isCompleted={completedIds.has(challenge.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { userId } = useUser();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6">
        {userId && <TopicContent slug={slug} userId={userId} />}
      </div>
    </AppShell>
  );
}
