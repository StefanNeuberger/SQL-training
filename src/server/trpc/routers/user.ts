import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { db } from "@/server/db";
import { users } from "@/server/db/app-schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  getOrCreate: publicProcedure
    .input(z.object({ username: z.string().min(1).max(100) }))
    .mutation(async ({ input }) => {
      const existing = await db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (existing) return existing;

      const [created] = await db
        .insert(users)
        .values({ username: input.username })
        .returning();

      return created;
    }),

  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      return db.query.users.findFirst({
        where: eq(users.username, input.username),
      });
    }),
});
