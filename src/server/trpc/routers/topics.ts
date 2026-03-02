import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { topics, challenges, userProgress } from "@/server/db/app-schema";
import { eq, asc } from "drizzle-orm";

export const topicsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return db.query.topics.findMany({
      orderBy: asc(topics.orderIndex),
      with: {
        challenges: {
          orderBy: asc(challenges.orderIndex),
        },
      },
    });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return db.query.topics.findFirst({
        where: eq(topics.slug, input.slug),
        with: {
          challenges: {
            orderBy: asc(challenges.orderIndex),
          },
        },
      });
    }),

  getWithProgress: publicProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .query(async ({ input }) => {
      const allTopics = await db.query.topics.findMany({
        orderBy: asc(topics.orderIndex),
        with: {
          challenges: {
            orderBy: asc(challenges.orderIndex),
          },
        },
      });

      const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, input.userId),
      });

      const completedIds = new Set(
        progress
          .filter((p) => p.completedAt !== null)
          .map((p) => p.challengeId)
      );

      return allTopics.map((topic) => ({
        ...topic,
        completedCount: topic.challenges.filter((c) =>
          completedIds.has(c.id)
        ).length,
        totalCount: topic.challenges.length,
      }));
    }),
});
