"use client";

import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

type QueryRow = Record<string, unknown>;

interface QueryResultProps {
  rows: QueryRow[];
  fields: string[];
  rowCount: number;
  truncated: boolean;
  error: string | null;
  isLoading?: boolean;
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function QueryResult({
  rows,
  fields,
  rowCount,
  truncated,
  error,
  isLoading,
}: QueryResultProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-blue-400" />
          <span className="text-sm">Running query…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-red-400">
          <XCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">Query Error</span>
        </div>
        <pre className="rounded-md bg-red-950/40 p-3 text-xs text-red-300 whitespace-pre-wrap break-words border border-red-900">
          {error}
        </pre>
      </div>
    );
  }

  if (rows.length === 0 && fields.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-500 text-sm">
        Run a query to see results here.
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-neutral-400 text-sm">
        <Info className="h-4 w-4" />
        Query returned 0 rows.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-neutral-400">
          {rowCount} row{rowCount !== 1 ? "s" : ""} returned
          {truncated && ` (showing first 200)`}
        </span>
        {truncated && (
          <span className="flex items-center gap-1 text-xs text-yellow-400">
            <AlertCircle className="h-3 w-3" />
            Results truncated
          </span>
        )}
      </div>
      <div className="overflow-auto rounded-md border border-neutral-700 flex-1">
        <table className="w-full min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-700 bg-neutral-800 sticky top-0">
              {fields.map((field) => (
                <th
                  key={field}
                  className="whitespace-nowrap px-3 py-2 text-left text-xs font-medium text-neutral-300 tracking-wide"
                >
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors"
              >
                {fields.map((field) => {
                  const val = row[field];
                  const isNull = val === null || val === undefined;
                  return (
                    <td
                      key={field}
                      className={`whitespace-nowrap px-3 py-1.5 font-mono text-xs ${
                        isNull ? "text-neutral-500 italic" : "text-neutral-200"
                      }`}
                    >
                      {formatCell(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface AnswerFeedbackProps {
  isCorrect: boolean | null;
}

export function AnswerFeedback({ isCorrect }: AnswerFeedbackProps) {
  if (isCorrect === null) return null;

  if (isCorrect) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-700 bg-green-950/40 px-4 py-3">
        <CheckCircle className="h-5 w-5 text-green-400" />
        <div>
          <p className="text-sm font-medium text-green-300">Correct!</p>
          <p className="text-xs text-green-500">Your query produces the expected result.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-700 bg-red-950/40 px-4 py-3">
      <XCircle className="h-5 w-5 text-red-400" />
      <div>
        <p className="text-sm font-medium text-red-300">Not quite right</p>
        <p className="text-xs text-red-500">The result doesn't match the expected output. Try again!</p>
      </div>
    </div>
  );
}
