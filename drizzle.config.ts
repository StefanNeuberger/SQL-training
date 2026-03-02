import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/server/db/app-schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["app"],
  verbose: true,
  strict: true,
});
