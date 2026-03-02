"use client";

import { AppShell } from "@/components/AppShell";
import { useUser } from "@/hooks/useUser";
import { trpc } from "@/lib/trpc/client";
import { ProgressBar } from "@/components/ProgressBar";
import { LevelBadge } from "@/components/LevelBadge";
import Link from "next/link";
import { ArrowRight, BookOpen, Map, Trophy } from "lucide-react";

const levelColors: Record<string, "emerald" | "blue" | "purple"> = {
  beginner: "emerald",
  intermediate: "blue",
  advanced: "purple",
};

function DashboardContent({ userId }: { userId: string }) {
  const { data: summary, isLoading } = trpc.progress.getSummary.useQuery({
    userId,
  });

  const { data: challenges } = trpc.challenges.getOrderedWithProgress.useQuery(
    { userId }
  );

  const nextChallenge = challenges?.find((c) => !c.progress?.completedAt);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Welcome back!</h2>
            <p className="mt-1 text-neutral-400">
              Keep going — you&apos;re making great progress.
            </p>
          </div>
          {summary && (
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">
                {summary.totalCompleted}
              </div>
              <div className="text-xs text-neutral-500">
                of {summary.totalChallenges} completed
              </div>
            </div>
          )}
        </div>

        {nextChallenge && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-blue-800/50 bg-blue-950/30 p-4">
            <div>
              <div className="text-xs text-blue-400 font-medium mb-1">
                Continue where you left off
              </div>
              <div className="font-medium text-white">
                {nextChallenge.title}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {nextChallenge.topic.name}
              </div>
            </div>
            <Link href={`/challenges/${nextChallenge.id}`}>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shrink-0">
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Level Progress */}
      {summary && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-neutral-300 uppercase tracking-wide">
            Progress by Level
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {summary.summary.map((s) => (
              <div
                key={s.level}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <LevelBadge level={s.level} size="sm" />
                  <span className="text-2xl font-bold text-white">
                    {s.percentage}%
                  </span>
                </div>
                <ProgressBar
                  value={s.percentage}
                  color={levelColors[s.level]}
                  showLabel={false}
                />
                <div className="mt-2 text-xs text-neutral-500">
                  {s.completed}/{s.total} challenges
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-neutral-300 uppercase tracking-wide">
          Quick Navigation
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/learn">
            <div className="group rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-600 hover:bg-neutral-800/50 transition-all">
              <Map className="mb-2 h-6 w-6 text-blue-400" />
              <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                Learning Path
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Follow the guided curriculum
              </div>
            </div>
          </Link>
          <Link href="/topics">
            <div className="group rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-600 hover:bg-neutral-800/50 transition-all">
              <BookOpen className="mb-2 h-6 w-6 text-purple-400" />
              <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                Browse Topics
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Practice specific SQL concepts
              </div>
            </div>
          </Link>
          <Link href="/progress">
            <div className="group rounded-xl border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-600 hover:bg-neutral-800/50 transition-all">
              <Trophy className="mb-2 h-6 w-6 text-amber-400" />
              <div className="font-medium text-white group-hover:text-amber-300 transition-colors">
                My Progress
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                View detailed stats
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { userId } = useUser();

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Your SQL training overview
          </p>
        </div>
        {userId && <DashboardContent userId={userId} />}
      </div>
    </AppShell>
  );
}
