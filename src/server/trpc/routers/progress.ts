import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { userProgress, challenges, topics } from "@/server/db/app-schema";
import { eq, and } from "drizzle-orm";

export const progressRouter = createTRPCRouter({
  getForUser: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.query.userProgress.findMany({
        where: eq(userProgress.userId, input.userId),
        with: {
          challenge: {
            with: { topic: true },
          },
        },
      });
    }),

  getForChallenge: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        challengeId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      return db.query.userProgress.findFirst({
        where: and(
          eq(userProgress.userId, input.userId),
          eq(userProgress.challengeId, input.challengeId)
        ),
      });
    }),

  recordAttempt: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        challengeId: z.string().uuid(),
        query: z.string(),
        isCorrect: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.query.userProgress.findFirst({
        where: and(
          eq(userProgress.userId, input.userId),
          eq(userProgress.challengeId, input.challengeId)
        ),
      });

      if (existing) {
        const [updated] = await db
          .update(userProgress)
          .set({
            attempts: existing.attempts + 1,
            lastQuery: input.query,
            completedAt:
              input.isCorrect && !existing.completedAt
                ? new Date()
                : existing.completedAt,
          })
          .where(eq(userProgress.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(userProgress)
        .values({
          userId: input.userId,
          challengeId: input.challengeId,
          attempts: 1,
          lastQuery: input.query,
          completedAt: input.isCorrect ? new Date() : null,
        })
        .returning();

      return created;
    }),

  getSummary: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      const allChallenges = await db.query.challenges.findMany({
        with: { topic: true },
      });

      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, input.userId),
      });

      const completedIds = new Set(
        progress.filter((p) => p.completedAt !== null).map((p) => p.challengeId)
      );

      const levels = ["beginner", "intermediate", "advanced"] as const;
      const summary = levels.map((level) => {
        const levelChallenges = allChallenges.filter(
          (c) => c.topic.level === level
        );
        const completed = levelChallenges.filter((c) =>
          completedIds.has(c.id)
        ).length;
        return {
          level,
          total: levelChallenges.length,
          completed,
          percentage:
            levelChallenges.length > 0
              ? Math.round((completed / levelChallenges.length) * 100)
              : 0,
        };
      });

      return {
        summary,
        totalCompleted: completedIds.size,
        totalChallenges: allChallenges.length,
      };
    }),
});
