import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../env";

export const db = env.DATABASE_URL ? drizzle(env.DATABASE_URL) : undefined; // Modify when the prod db is set up
