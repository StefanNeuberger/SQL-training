import { createTRPCRouter } from "./trpc";
import { userRouter } from "./routers/user";
import { topicsRouter } from "./routers/topics";
import { challengesRouter } from "./routers/challenges";
import { progressRouter } from "./routers/progress";
import { queryRouter } from "./routers/query";

export const appRouter = createTRPCRouter({
  user: userRouter,
  topics: topicsRouter,
  challenges: challengesRouter,
  progress: progressRouter,
  query: queryRouter,
});

export type AppRouter = typeof appRouter;
