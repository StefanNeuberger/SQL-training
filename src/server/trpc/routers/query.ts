import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { trainingPool } from "@/server/db";
import { db } from "@/server/db";
import { challenges } from "@/server/db/app-schema";
import { eq } from "drizzle-orm";

const STATEMENT_TIMEOUT_MS = 5000;
const MAX_ROWS = 200;

/** Loosely detect non-SELECT statements before sending to DB */
function isReadOnlyQuery(sql: string): boolean {
  const stripped = sql
    .replace(/--[^\n]*/g, "") // remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove multi-line comments
    .trim()
    .toUpperCase();

  const forbidden = [
    "INSERT",
    "UPDATE",
    "DELETE",
    "DROP",
    "CREATE",
    "ALTER",
    "TRUNCATE",
    "GRANT",
    "REVOKE",
    "COPY",
    "VACUUM",
    "ANALYZE",
    "CLUSTER",
    "REINDEX",
    "REFRESH",
  ];

  for (const kw of forbidden) {
    if (stripped.startsWith(kw) || stripped.includes(`\n${kw}`) || stripped.includes(` ${kw}`)) {
      // Allow EXPLAIN ANALYZE (read-only diagnostic)
      if (kw === "ANALYZE" && stripped.startsWith("EXPLAIN")) continue;
      // More precise check: word boundary
      const regex = new RegExp(`(^|[^A-Z])${kw}([^A-Z]|$)`);
      if (regex.test(stripped)) return false;
    }
  }

  return true;
}

type QueryRow = Record<string, unknown>;

function normalizeRows(rows: QueryRow[]): string {
  return JSON.stringify(
    rows
      .map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([k, v]) => [
            k,
            v instanceof Date ? v.toISOString() : String(v ?? ""),
          ])
        )
      )
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  );
}

async function executeQuery(
  sql: string,
  params: unknown[] = []
): Promise<{ rows: QueryRow[]; fields: string[]; rowCount: number; truncated: boolean }> {
  const client = await trainingPool.connect();
  try {
    await client.query("BEGIN READ ONLY");
    await client.query(`SET LOCAL statement_timeout = '${STATEMENT_TIMEOUT_MS}'`);
    await client.query("SET LOCAL search_path = training, pg_catalog");

    const result = await client.query(sql, params);

    const truncated = result.rows.length > MAX_ROWS;
    const rows = result.rows.slice(0, MAX_ROWS) as QueryRow[];
    const fields = result.fields?.map((f) => f.name) ?? [];

    return { rows, fields, rowCount: result.rowCount ?? rows.length, truncated };
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
}

export const queryRouter = createTRPCRouter({
  execute: publicProcedure
    .input(
      z.object({
        sql: z.string().min(1).max(10_000),
      })
    )
    .mutation(async ({ input }) => {
      if (!isReadOnlyQuery(input.sql)) {
        return {
          success: false as const,
          error: "Only SELECT statements (and EXPLAIN) are allowed.",
          rows: [] as QueryRow[],
          fields: [] as string[],
          rowCount: 0,
          truncated: false,
        };
      }

      try {
        const result = await executeQuery(input.sql);
        return {
          success: true as const,
          ...result,
          error: null,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        return {
          success: false as const,
          error: message,
          rows: [] as QueryRow[],
          fields: [] as string[],
          rowCount: 0,
          truncated: false,
        };
      }
    }),

  validate: publicProcedure
    .input(
      z.object({
        challengeId: z.string().uuid(),
        userSql: z.string().min(1).max(10_000),
      })
    )
    .mutation(async ({ input }) => {
      const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, input.challengeId),
      });

      if (!challenge) {
        return { correct: false, error: "Challenge not found." };
      }

      if (!isReadOnlyQuery(input.userSql)) {
        return {
          correct: false,
          error: "Only SELECT statements are allowed.",
          userRows: [] as QueryRow[],
          userFields: [] as string[],
        };
      }

      try {
        const [userResult, solutionResult] = await Promise.all([
          executeQuery(input.userSql),
          executeQuery(challenge.solutionQuery),
        ]);

        const { validationType } = challenge;
        let correct = false;

        if (validationType === "count") {
          correct = userResult.rowCount === solutionResult.rowCount;
        } else if (validationType === "contains") {
          const solutionNorm = normalizeRows(solutionResult.rows);
          const userNorm = normalizeRows(userResult.rows);
          // Check that all solution rows appear in user result
          const solutionRows = solutionResult.rows.map((r) =>
            JSON.stringify(
              Object.fromEntries(
                Object.entries(r).map(([k, v]) => [
                  k,
                  v instanceof Date ? v.toISOString() : String(v ?? ""),
                ])
              )
            )
          );
          const userRowSet = new Set(
            userResult.rows.map((r) =>
              JSON.stringify(
                Object.fromEntries(
                  Object.entries(r).map(([k, v]) => [
                    k,
                    v instanceof Date ? v.toISOString() : String(v ?? ""),
                  ])
                )
              )
            )
          );
          correct = solutionRows.every((r) => userRowSet.has(r));
        } else {
          // exact: order-insensitive exact match
          correct =
            normalizeRows(userResult.rows) ===
            normalizeRows(solutionResult.rows);
        }

        return {
          correct,
          error: null,
          userRows: userResult.rows,
          userFields: userResult.fields,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        return {
          correct: false,
          error: message,
          userRows: [] as QueryRow[],
          userFields: [] as string[],
        };
      }
    }),
});
