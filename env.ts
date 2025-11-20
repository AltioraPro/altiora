import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
    DATABASE_URL: z.url(),

    BETTER_AUTH_SECRET: z.string().min(1),

    RESEND_API_KEY: z.string().min(1),
    ADMIN_EMAIL: z.email(),

    REDIS_URL: z.url(),

    AUTUMN_SECRET_KEY: z.string().min(1),

    DISCORD_CLIENT_ID: z.string().min(1),
    DISCORD_CLIENT_SECRET: z.string().min(1),
    DISCORD_BOT_TOKEN: z.string().min(1),
    DISCORD_GUILD_ID: z.string().min(1),

    DISCORD_BOT_WEBHOOK_URL: z.string().min(1),

    ADMIN_API_USERNAME: z.string().min(1),
    ADMIN_API_PASSWORD: z.string().min(1),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    VERCEL_URL: z.string().optional(),
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
    VERCEL_BRANCH_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
    NEXT_PUBLIC_REACT_QUERY_DEVTOOLS: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_REACT_SCAN_DEVTOOLS: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_ROOT_DOMAIN: z.string().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_REACT_QUERY_DEVTOOLS:
      process.env.NEXT_PUBLIC_REACT_QUERY_DEVTOOLS,
    NEXT_PUBLIC_REACT_SCAN_DEVTOOLS:
      process.env.NEXT_PUBLIC_REACT_SCAN_DEVTOOLS,
    NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
  },
  onValidationError: (issues) => {
    throw new Error(`Invalid environment variables: ${JSON.stringify(issues)}`);
  },
});
