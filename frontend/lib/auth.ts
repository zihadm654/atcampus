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
    minPasswordLength: 8,
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
        const selectedRole = ctx.body.role;

        // Validate and normalize the role
        const validRoles = ["STUDENT", "PROFESSOR", "INSTITUTION", "ORGANIZATION", "ADMIN"];
        let role = "STUDENT"; // Default fallback

        if (selectedRole && validRoles.includes(String(selectedRole).toUpperCase())) {
          role = String(selectedRole).toUpperCase();
        }

        // Determine status based on role
        let status = "ACTIVE";
        if (role === "INSTITUTION" || role === "ORGANIZATION") {
          status = "PENDING";
        }

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              name,
              role,
              status
            }
          },
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
          // Log the incoming user data for debugging
          console.log("Database hook received user:", {
            email: user.email,
            role: user.role,
            status: user.status
          });

          // The role and status should already be properly set by the auth middleware
          // We only need to handle admin override here

          let finalRole = user.role || "STUDENT";
          let finalStatus = user.status || "PENDING";

          // Ensure role is a valid enum value
          const validRoles = ["STUDENT", "PROFESSOR", "INSTITUTION", "ORGANIZATION", "ADMIN"];
          if (!validRoles.includes(finalRole)) {
            console.log("Invalid role detected, defaulting to STUDENT:", finalRole);
            finalRole = "STUDENT";
          }

          // Ensure status is a valid enum value
          const validStatuses = ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"];
          if (!validStatuses.includes(finalStatus)) {
            finalStatus = "PENDING";
          }

          // Admin override - only if email matches admin list
          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(";") ?? [];
          if (ADMIN_EMAILS.includes(user.email)) {
            console.log("Admin override triggered for email:", user.email);
            finalRole = "ADMIN";
            finalStatus = "ACTIVE"; // Admin always active
          }

          // Only update if values have changed
          if (finalRole !== user.role || finalStatus !== user.status) {
            console.log("Updating user role/status:", {
              original: { role: user.role, status: user.status },
              updated: { role: finalRole, status: finalStatus }
            });

            return {
              data: {
                ...user,
                role: finalRole,
                status: finalStatus
              }
            };
          }

          // Return unchanged user data
          return {
            data: user
          };
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
        required: false
      },
      instituteId: {
        type: "string",
        input: true,
        required: false
      },
      role: {
        type: ["STUDENT", "PROFESSOR", "INSTITUTION", "ORGANIZATION", "ADMIN"],
        input: true,
        required: true
      },
      status: {
        type: ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"],
        input: false,
        required: true
      },
      phone: {
        type: "string",
        input: true,
        required: false
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
      // Configure organization schema mapping
      schema: {
        organization: {
          modelName: "Organization",
          fields: {
            name: "name",
            slug: "slug",
            logo: "logo",
            createdAt: "createdAt",
          },
        },
        member: {
          modelName: "Member",
          fields: {
            userId: "userId",
            organizationId: "organizationId",
            role: "role",
            createdAt: "createdAt",
          },
        },
        invitation: {
          modelName: "Invitation",
          fields: {
            email: "email",
            organizationId: "organizationId",
            inviterId: "inviterId",
            role: "role",
            status: "status",
            expiresAt: "expiresAt",
          },
        },
      },
      // Configure invitation settings
      invitation: {
        // Enable invitation expiration
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
        // Allow organization members to send invitations
        requireAdmin: false,
        // Enable invitation metadata support
        allowCustomMetadata: true,
      },

      // Enable multi-organization support
      allowUsersToCreateOrganizations: true,
      // Enable teams support
      teams: {
        enabled: true,
      },
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

// Define our custom user properties
interface CustomUserProperties {
  role: "STUDENT" | "PROFESSOR" | "INSTITUTION" | "ORGANIZATION" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  username?: string;
  institution?: string;
  instituteId?: string;
  phone?: string;
}

// Extended user type that combines better-auth User with our custom properties
type ExtendedUser = User & CustomUserProperties;
