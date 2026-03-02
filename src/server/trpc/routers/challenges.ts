import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { challenges, userProgress } from "@/server/db/app-schema";
import { eq, asc, and } from "drizzle-orm";

export const challengesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db.query.challenges.findMany({
      orderBy: asc(challenges.orderIndex),
      with: { topic: true },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.query.challenges.findFirst({
        where: eq(challenges.id, input.id),
        with: { topic: true },
      });
    }),

  getByTopic: publicProcedure
    .input(z.object({ topicId: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.query.challenges.findMany({
        where: eq(challenges.topicId, input.topicId),
        orderBy: asc(challenges.orderIndex),
        with: { topic: true },
      });
    }),

  getOrderedWithProgress: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      const allChallenges = await db.query.challenges.findMany({
        orderBy: [asc(challenges.difficulty), asc(challenges.orderIndex)],
        with: { topic: true },
      });

      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, input.userId),
      });

      const progressMap = new Map(
        progress.map((p) => [p.challengeId, p])
      );

      return allChallenges.map((c) => ({
        ...c,
        progress: progressMap.get(c.id) ?? null,
      }));
    }),

  getSolution: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, input.id),
        columns: { solutionQuery: true },
      });
      return { solutionQuery: challenge?.solutionQuery ?? null };
    }),

  getAdjacentChallenges: publicProcedure
    .input(z.object({ challengeId: z.string().uuid() }))
    .query(async ({ input }) => {
      const allChallenges = await db.query.challenges.findMany({
        orderBy: [asc(challenges.difficulty), asc(challenges.orderIndex)],
        with: { topic: true },
      });

      const currentIndex = allChallenges.findIndex(
        (c) => c.id === input.challengeId
      );

      return {
        prev: currentIndex > 0 ? allChallenges[currentIndex - 1] : null,
        next:
          currentIndex < allChallenges.length - 1
            ? allChallenges[currentIndex + 1]
            : null,
      };
    }),
});
