import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // This is optional because it's only used in development.
    // See https://better-auth.js.org/deployment.
    BETTER_AUTH_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
    NODEMAILER_USER: z.string().min(1),
    NODEMAILER_APP_PASSWORD: z.string().min(1),
    UPLOADTHING_TOKEN: z.string().min(1),
    NEXT_PUBLIC_STREAM_KEY: z.string().min(1),
    STREAM_SECRET: z.string().min(1),
    UPLOADTHING_SECRET: z.string().min(1),
    NEXT_PUBLIC_UPLOADTHING_APP_ID: z.string().min(1),
    CRON_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
  },
  runtimeEnv: {
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NODEMAILER_USER: process.env.NODEMAILER_USER,
    NODEMAILER_APP_PASSWORD: process.env.NODEMAILER_APP_PASSWORD,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NEXT_PUBLIC_STREAM_KEY: process.env.NEXT_PUBLIC_STREAM_KEY,
    STREAM_SECRET: process.env.STREAM_SECRET,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    NEXT_PUBLIC_UPLOADTHING_APP_ID: process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
    CRON_SECRET: process.env.CRON_SECRET,
  },
});
