"use client";

import { AppShell } from "@/components/AppShell";
import { ProgressBar } from "@/components/ProgressBar";
import { LevelBadge } from "@/components/LevelBadge";
import { useUser } from "@/hooks/useUser";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { CheckCircle, Circle, Trophy } from "lucide-react";

const levelColors: Record<string, "emerald" | "blue" | "purple"> = {
  beginner: "emerald",
  intermediate: "blue",
  advanced: "purple",
};

function ProgressContent({ userId }: { userId: string }) {
  const { data: progress, isLoading } = trpc.progress.getForUser.useQuery({
    userId,
  });
  const { data: summary } = trpc.progress.getSummary.useQuery({ userId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-400" />
      </div>
    );
  }

  const completedItems = progress?.filter((p) => p.completedAt !== null) ?? [];
  const inProgressItems =
    progress?.filter((p) => p.completedAt === null && p.attempts > 0) ?? [];

  return (
    <div className="space-y-8">
      {/* Overview stats */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {summary.totalCompleted}
            </div>
            <div className="mt-1 text-xs text-neutral-500">Completed</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
            <div className="text-3xl font-bold text-amber-400">
              {inProgressItems.length}
            </div>
            <div className="mt-1 text-xs text-neutral-500">In Progress</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
            <div className="text-3xl font-bold text-neutral-300">
              {summary.totalChallenges - summary.totalCompleted - inProgressItems.length}
            </div>
            <div className="mt-1 text-xs text-neutral-500">Remaining</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {summary.totalChallenges > 0
                ? Math.round(
                    (summary.totalCompleted / summary.totalChallenges) * 100
                  )
                : 0}
              %
            </div>
            <div className="mt-1 text-xs text-neutral-500">Overall</div>
          </div>
        </div>
      )}

      {/* Level breakdown */}
      {summary && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-neutral-300 uppercase tracking-wide">
            Progress by Level
          </h2>
          <div className="space-y-3">
            {summary.summary.map((s) => (
              <div
                key={s.level}
                className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <LevelBadge level={s.level} />
                <div className="flex-1">
                  <ProgressBar
                    value={s.percentage}
                    color={levelColors[s.level]}
                    showLabel
                  />
                </div>
                <div className="text-sm text-neutral-400 shrink-0">
                  {s.completed}/{s.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed challenges */}
      {completedItems.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-neutral-300 uppercase tracking-wide">
            <Trophy className="h-4 w-4 text-amber-400" />
            Completed Challenges ({completedItems.length})
          </h2>
          <div className="space-y-2">
            {completedItems.map((item) => (
              <Link key={item.id} href={`/challenges/${item.challengeId}`}>
                <div className="flex items-center gap-3 rounded-lg border border-emerald-800/30 bg-emerald-950/20 p-3 hover:border-emerald-700/50 hover:bg-emerald-950/30 transition-all">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium text-sm text-emerald-200">
                      {item.challenge.title}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {item.challenge.topic.name} · {item.attempts} attempt
                      {item.attempts !== 1 ? "s" : ""}
                    </div>
                  </div>
                  {item.completedAt && (
                    <div className="text-xs text-neutral-500 shrink-0">
                      {new Date(item.completedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* In progress challenges */}
      {inProgressItems.length > 0 && (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-neutral-300 uppercase tracking-wide">
            Started but not yet completed ({inProgressItems.length})
          </h2>
          <div className="space-y-2">
            {inProgressItems.map((item) => (
              <Link key={item.id} href={`/challenges/${item.challengeId}`}>
                <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 hover:border-neutral-600 hover:bg-neutral-800/50 transition-all">
                  <Circle className="h-4 w-4 text-neutral-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium text-sm text-white">
                      {item.challenge.title}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {item.challenge.topic.name} · {item.attempts} attempt
                      {item.attempts !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {completedItems.length === 0 && inProgressItems.length === 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-10 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-neutral-600" />
          <p className="text-neutral-400">No challenges attempted yet.</p>
          <Link href="/learn">
            <button className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
              Start Learning
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const { userId } = useUser();

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">My Progress</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Track your SQL training journey
          </p>
        </div>
        {userId && <ProgressContent userId={userId} />}
      </div>
    </AppShell>
  );
}
