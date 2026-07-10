import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .url()
    .refine(
      (value) => value.startsWith("postgresql://") || value.startsWith("postgres://"),
      "DATABASE_URL must be a PostgreSQL connection URL",
    )
    .optional(), // Remove when the prod db is set up
});

export const env = envSchema.parse(process.env);
