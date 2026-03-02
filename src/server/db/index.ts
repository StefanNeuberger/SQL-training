import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./app-schema";

const connectionString = process.env.DATABASE_URL!;

// App database pool (Drizzle ORM, `app` schema)
const appPool = new Pool({
  connectionString,
  max: 10,
});

export const db = drizzle(appPool, { schema });

// Training database pool (raw pg, `training` schema, read-only)
export const trainingPool = new Pool({
  connectionString,
  max: 5,
});
