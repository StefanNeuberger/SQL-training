import {
  pgSchema,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const appSchema = pgSchema("app");

// ─── Enums ────────────────────────────────────────────────────────────────────

export const levelEnum = pgEnum("level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const validationTypeEnum = pgEnum("validation_type", [
  "exact",
  "count",
  "contains",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = appSchema.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const topics = appSchema.table("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  level: levelEnum("level").notNull(),
  orderIndex: integer("order_index").notNull(),
  icon: varchar("icon", { length: 50 }),
});

export const challenges = appSchema.table("challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id")
    .notNull()
    .references(() => topics.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  difficulty: integer("difficulty").notNull(), // 1-10
  solutionQuery: text("solution_query").notNull(),
  hint: text("hint"),
  orderIndex: integer("order_index").notNull(),
  validationType: validationTypeEnum("validation_type").notNull().default("exact"),
});

export const userProgress = appSchema.table("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  challengeId: uuid("challenge_id")
    .notNull()
    .references(() => challenges.id),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  attempts: integer("attempts").notNull().default(0),
  lastQuery: text("last_query"),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const topicsRelations = relations(topics, ({ many }) => ({
  challenges: many(challenges),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  topic: one(topics, {
    fields: [challenges.topicId],
    references: [topics.id],
  }),
  userProgress: many(userProgress),
}));

export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userProgress.challengeId],
    references: [challenges.id],
  }),
}));
