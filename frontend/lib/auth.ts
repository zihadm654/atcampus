import { sendEmailAction } from "@/actions/send-email.action";
import { reactInvitationEmail } from "@/emails/invitation";
import { reactResetPasswordEmail } from "@/emails/reset-password";
import { render } from "@react-email/components";
import { betterAuth, User, type BetterAuthOptions } from "better-auth";
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
import { getActiveOrganization } from "@/actions/organizations";
import VerifyEmail from "@/emails/verify-email";

const options = {
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  emailVerification: {
    sendOnSignUp: false,
    expiresIn: 60 * 60,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set("callbackURL", "/verify");
      await transporter.sendMail({
        to: user.email,
        subject: "Verify your email address",
        html: await render(
          VerifyEmail({
            username: user.name,
            verifyUrl: String(link)
          })
        )
      })
    }
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
        html: await render(
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
        before: async (user: ExtendedUser) => {
          const newRole = user.role;

          if (
            newRole === "INSTITUTION" ||
            newRole === "ORGANIZATION"
          ) {
            user = { ...user, role: newRole, status: "PENDING" };
          } else {
            user = { ...user, role: newRole, status: "ACTIVE" };
          }

          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(";") ?? [];
          if (ADMIN_EMAILS.includes(user.email)) {
            user = { ...user, role: "ADMIN" };
          }

          return { data: user };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId)
          return {
            data: {
              ...session,
              activeOrganizationId: organization?.id
            }
          }
        }
      }
    }
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
        type: ["STUDENT", "PROFESSOR", "INSTITUTION", "ORGANIZATION", "ADMIN"],
        input: true,
      },
      status: {
        type: ["PENDING", "ACTIVE", "REJECTED"],
        input: true,
      },
      phone: {
        type: "string",
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
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
      adminRoles: ["ADMIN"],
      ac,
      roles,
    }),
    organization({
      allowUserToCreateOrganization: async (user: ExtendedUser) => {
        const institution = user.role === "INSTITUTION";
        return institution;
      },
      // Set invitation expiration to 30 days (in seconds)
      invitationExpiresIn: 60 * 60 * 24 * 30,
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
                  : `${process.env.BETTER_AUTH_URL ||
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
          status: user.status,
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
interface ExtendedUser extends User {
  role: "STUDENT" | "PROFESSOR" | "INSTITUTION" | "ORGANIZATION" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED";
  username: string
  // ... other additional fields
}
