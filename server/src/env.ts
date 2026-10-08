import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(), // Remove when the prod db is set up
  AUTH_SERVER_URL: z.url({ protocol: /^https?$/ }).optional(),
});

export const env = envSchema.parse(process.env);
