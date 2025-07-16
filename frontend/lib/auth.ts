import { sendEmailAction } from "@/actions/send-email.action";
import { reactInvitationEmail } from "@/emails/invitation";
import { reactResetPasswordEmail } from "@/emails/reset-password";
import { render } from "@react-email/components";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import {
  admin,
  customSession,
  magicLink,
  multiSession,
  organization,
  twoFactor,
  username,
} from "better-auth/plugins";

import { env } from "@/env.mjs";
import { hashPassword, verifyPassword } from "@/lib/argon2";
import { prisma } from "@/lib/db";
import { ac, roles } from "@/lib/permissions";
import { normalizeName, VALID_DOMAINS } from "@/lib/utils";

import transporter from "./nodemailer";

const options = {
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set("callbackURL", "/verify");

      await sendEmailAction({
        to: user.email,
        subject: "Verify your email address",
        meta: {
          description:
            "Please verify your email address to complete the registration process.",
          link: String(link),
        },
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    requireEmailVerification: false,
    async sendResetPassword({ user, url }) {
      await transporter.sendMail({
        to: user.email,
        subject: "Reset your password",
        htnl: await render(
          reactResetPasswordEmail({
            username: user.email,
            resetLink: url,
          }),
        ),
      });
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = String(ctx.body.email);
        const domain = email.split("@")[1].toLowerCase();

        if (!VALID_DOMAINS().includes(domain)) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid domain. Please use a valid email.",
          });
        }

        const name = normalizeName(ctx.body.name);

        return {
          context: { ...ctx, body: { ...ctx.body, name } },
        };
      }

      if (ctx.path === "/sign-in/magic-link") {
        const name = normalizeName(ctx.body.name);

        return {
          context: { ...ctx, body: { ...ctx.body, name } },
        };
      }

      if (ctx.path === "/update-user") {
        const name = normalizeName(ctx.body.name);

        return {
          context: { ...ctx, body: { ...ctx.body, name } },
        };
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(";") ?? [];

          if (ADMIN_EMAILS.includes(user.email)) {
            return { data: { ...user, role: "INSTITUTION" } };
          }

          return { data: user };
        },
      },
    },
  },
  user: {
    additionalFields: {
      institution: {
        type: "string",
        input: true,
      },
      instituteId: {
        type: "string",
        input: true,
      },
      role: {
        type: ["STUDENT", "PROFESSOR", "INSTITUTION", "ORGANIZATION"],
        input: true,
      },
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  account: {
    accountLinking: {
      enabled: false,
      trustedProviders: ["google", "github", "demo-app"],
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  socialProviders: {
    google: {
      clientId: String(env.GOOGLE_CLIENT_ID),
      clientSecret: String(env.GOOGLE_CLIENT_SECRET),
    },
  },
  plugins: [
    nextCookies(),
    username(),
    admin({
      defaultRole: "STUDENT",
      adminRoles: ["INSTITUTION", "PROFESSOR", "ORGANIZATION"],
      ac,
      roles,
    }),
    organization({
      async sendInvitationEmail(data) {
        await transporter.sendMail({
          to: data.email,
          subject: "You've been invited to join an organization",
          html: await render(
            reactInvitationEmail({
              username: data.email,
              invitedByUsername: data.inviter.user.name,
              invitedByEmail: data.inviter.user.email,
              teamName: data.organization.name,
              inviteLink:
                process.env.NODE_ENV === "development"
                  ? `http://localhost:3000/accept-invitation/${data.id}`
                  : `${
                      process.env.BETTER_AUTH_URL ||
                      process.env.NEXT_PUBLIC_APP_URL
                    }/accept-invitation/${data.id}`,
            }),
          ),
        });
      },
    }),
    multiSession({ maximumSessions: 3 }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await transporter.sendMail({
            to: user.email,
            subject: "Your OTP",
            html: `Your OTP is ${otp}`,
          });
        },
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmailAction({
          to: email,
          subject: "Magic Link Login",
          meta: {
            description: "Please click the link below to log in.",
            link: String(url),
          },
        });
      },
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth({
  ...options,
  plugins: [
    ...(options.plugins ?? []),
    customSession(async ({ user, session }) => {
      return {
        session: {
          expiresAt: session.expiresAt,
          token: session.token,
          userAgent: session.userAgent,
          impersonatedBy: session.impersonatedBy,
        },
        user: {
          id: user.id,
          username: user.username,
          displayUsername: user.displayUsername,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: user.role,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
        },
      };
    }, options),
  ],
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOWN";
