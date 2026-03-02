"use client";

import { useState } from "react";
import { Database } from "lucide-react";

interface UserSetupProps {
  onLogin: (username: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserSetup({ onLogin, isLoading }: UserSetupProps) {
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onLogin(username.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SQL Training</h1>
          <p className="mt-2 text-neutral-400">
            Master PostgreSQL through hands-on challenges
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <h2 className="mb-4 text-lg font-semibold text-white">
            Enter your name to get started
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name..."
              maxLength={100}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!username.trim() || submitting || isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {submitting ? "Starting…" : "Start Learning"}
            </button>
          </div>
        </form>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Difficulty Levels", value: "3" },
            { label: "SQL Topics", value: "15+" },
            { label: "Challenges", value: "60+" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-3"
            >
              <div className="text-2xl font-bold text-blue-400">{value}</div>
              <div className="text-xs text-neutral-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
