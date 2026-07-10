import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }).optional(), // Remove when the prod db is set up
});

export const env = envSchema.parse(process.env);
