"use client";

import { use, useState, useCallback } from "react";
import { AppShell } from "@/components/AppShell";
import { QueryEditor } from "@/components/QueryEditor";
import { QueryResult, AnswerFeedback } from "@/components/QueryResult";
import { SchemaReference } from "@/components/SchemaReference";
import { LevelBadge } from "@/components/LevelBadge";
import { useUser } from "@/hooks/useUser";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Play,
  RotateCcw,
  CheckSquare,
} from "lucide-react";

type QueryRow = Record<string, unknown>;

function DifficultyBar({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-3 rounded-full ${
            i < difficulty ? "bg-blue-400" : "bg-neutral-700"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-neutral-500">{difficulty}/10</span>
    </div>
  );
}

function ChallengeDetailContent({
  challengeId,
  userId,
}: {
  challengeId: string;
  userId: string;
}) {
  const { data: challenge, isLoading } = trpc.challenges.getById.useQuery({
    id: challengeId,
  });
  const { data: adjacent } = trpc.challenges.getAdjacentChallenges.useQuery({
    challengeId,
  });
  const { data: existingProgress } = trpc.progress.getForChallenge.useQuery({
    userId,
    challengeId,
  });

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{
    rows: QueryRow[];
    fields: string[];
    rowCount: number;
    truncated: boolean;
    error: string | null;
  } | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [schemaOpen, setSchemaOpen] = useState(true);

  const executeQuery = trpc.query.execute.useMutation();
  const validateQuery = trpc.query.validate.useMutation();
  const recordAttempt = trpc.progress.recordAttempt.useMutation();
  const utils = trpc.useUtils();

  const handleRun = useCallback(async () => {
    if (!query.trim()) return;
    setIsCorrect(null);
    const res = await executeQuery.mutateAsync({ sql: query });
    setResult({
      rows: res.rows as QueryRow[],
      fields: res.fields,
      rowCount: res.rowCount,
      truncated: res.truncated,
      error: res.error,
    });
  }, [query, executeQuery]);

  const handleCheckAnswer = useCallback(async () => {
    if (!query.trim()) return;

    const res = await validateQuery.mutateAsync({
      challengeId,
      userSql: query,
    });

    // Update result display with user's query result
    setResult({
      rows: (res.userRows ?? []) as QueryRow[],
      fields: res.userFields ?? [],
      rowCount: (res.userRows ?? []).length,
      truncated: false,
      error: res.error,
    });

    const correct = res.correct;
    setIsCorrect(correct);

    // Record the attempt
    await recordAttempt.mutateAsync({
      userId,
      challengeId,
      query,
      isCorrect: correct,
    });

    // Invalidate progress queries
    await utils.progress.getForChallenge.invalidate({ userId, challengeId });
    await utils.progress.getSummary.invalidate({ userId });
    await utils.challenges.getOrderedWithProgress.invalidate({ userId });
  }, [
    query,
    challengeId,
    userId,
    validateQuery,
    recordAttempt,
    utils,
  ]);

  const handleReset = useCallback(() => {
    setQuery("");
    setResult(null);
    setIsCorrect(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-400" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Challenge not found.
      </div>
    );
  }

  const isAlreadyCompleted = !!existingProgress?.completedAt;

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={`/topics/${challenge.topic.slug}`}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {challenge.topic.name}
          </Link>
          <div className="h-4 w-px bg-neutral-700" />
          <LevelBadge level={challenge.topic.level} size="sm" />
        </div>

        {/* Adjacent navigation */}
        <div className="flex items-center gap-2">
          {adjacent?.prev && (
            <Link
              href={`/challenges/${adjacent.prev.id}`}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Prev
            </Link>
          )}
          {adjacent?.next && (
            <Link
              href={`/challenges/${adjacent.next.id}`}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors"
            >
              Next
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Challenge info */}
        <div className="flex w-80 shrink-0 flex-col border-r border-neutral-800 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Title & difficulty */}
            <div>
              <h1 className="text-base font-bold text-white">{challenge.title}</h1>
              <div className="mt-2">
                <DifficultyBar difficulty={challenge.difficulty} />
              </div>
              {isAlreadyCompleted && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckSquare className="h-3.5 w-3.5" />
                  Completed
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Challenge
              </div>
              <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
                {challenge.description}
              </p>
            </div>

            {/* Hint */}
            {challenge.hint && (
              <div>
                <button
                  onClick={() => setHintOpen((o) => !o)}
                  className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {hintOpen ? "Hide hint" : "Show hint"}
                  {hintOpen ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {hintOpen && (
                  <div className="mt-2 rounded-lg border border-amber-800/50 bg-amber-950/30 p-3">
                    <p className="text-xs text-amber-200 leading-relaxed">
                      {challenge.hint}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-neutral-800" />

            {/* Schema reference */}
            <div>
              <button
                onClick={() => setSchemaOpen((o) => !o)}
                className="flex w-full items-center justify-between text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2 hover:text-neutral-300 transition-colors"
              >
                <span>Schema</span>
                {schemaOpen ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {schemaOpen && <SchemaReference />}
            </div>
          </div>
        </div>

        {/* Right panel — Editor + Results */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Editor section */}
          <div className="flex flex-col border-b border-neutral-800" style={{ height: "45%" }}>
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-2 bg-neutral-900 shrink-0">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                SQL Query
              </span>
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 font-mono text-xs">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 font-mono text-xs">
                  Enter
                </kbd>
                <span>to run</span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <QueryEditor
                value={query}
                onChange={setQuery}
                onRun={handleRun}
                disabled={executeQuery.isPending}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 border-b border-neutral-800 bg-neutral-900 px-4 py-2 shrink-0">
            <button
              onClick={handleRun}
              disabled={!query.trim() || executeQuery.isPending}
              className="flex items-center gap-2 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              <Play className="h-4 w-4" />
              {executeQuery.isPending ? "Running…" : "Run Query"}
            </button>
            <button
              onClick={handleCheckAnswer}
              disabled={!query.trim() || validateQuery.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              <CheckSquare className="h-4 w-4" />
              {validateQuery.isPending ? "Checking…" : "Check Answer"}
            </button>
            {isCorrect && adjacent?.next && (
              <Link href={`/challenges/${adjacent.next.id}`}>
                <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">
                  Next Challenge
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            )}
            <div className="flex-1" />
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>

          {/* Results section */}
          <div className="flex flex-1 flex-col gap-3 overflow-hidden p-4">
            {isCorrect !== null && <AnswerFeedback isCorrect={isCorrect} />}
            <div className="flex-1 overflow-hidden">
              <QueryResult
                rows={result?.rows ?? []}
                fields={result?.fields ?? []}
                rowCount={result?.rowCount ?? 0}
                truncated={result?.truncated ?? false}
                error={result?.error ?? null}
                isLoading={executeQuery.isPending || validateQuery.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { userId } = useUser();

  return (
    <AppShell>
      <div className="h-screen flex flex-col">
        {userId && (
          <ChallengeDetailContent challengeId={id} userId={userId} />
        )}
      </div>
    </AppShell>
  );
}
