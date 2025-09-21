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

// Define our custom user properties with proper TypeScript types
interface CustomUserProperties {
  role: "STUDENT" | "PROFESSOR" | "INSTITUTION" | "ORGANIZATION" | "ADMIN";
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  username?: string;
  institution?: string;
  instituteId?: string;
  phone?: string;
}

// Extended user type that combines better-auth User with our custom properties
export type ExtendedUser = User & CustomUserProperties;

const options = {
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  baseURL: env.NEXT_PUBLIC_APP_URL,
  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 60 * 60 * 24, // 24 hours
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

        // Validate email domain
        if (!VALID_DOMAINS().includes(domain)) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid domain. Please use a valid institutional email.",
          });
        }

        // Normalize user name
        const name = normalizeName(ctx.body.name);

        // Validate and normalize the role
        const validRoles = ["STUDENT", "PROFESSOR", "INSTITUTION", "ORGANIZATION", "ADMIN"];
        let role = "STUDENT"; // Default fallback

        if (ctx.body.role && validRoles.includes(String(ctx.body.role).toUpperCase())) {
          role = String(ctx.body.role).toUpperCase() as CustomUserProperties["role"];
        }

        // Determine status based on role
        let status: CustomUserProperties["status"] = "PENDING";
        if (role === "ADMIN") {
          status = "ACTIVE"; // Admins are automatically active
        } else if (role === "STUDENT" || role === "PROFESSOR") {
          status = "ACTIVE"; // Students and professors are automatically active
        }
        // INSTITUTION and ORGANIZATION remain PENDING for approval

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

      return ctx;
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: any) => {
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
          const validRoles: string[] = ["STUDENT", "PROFESSOR", "INSTITUTION", "ORGANIZATION", "ADMIN"];
          if (!validRoles.includes(finalRole)) {
            console.log("Invalid role detected, defaulting to STUDENT:", finalRole);
            finalRole = "STUDENT";
          }

          // Ensure status is a valid enum value
          const validStatuses: string[] = ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"];
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
        input: false, // Status is managed by the system, not user input
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
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session if older than 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ["google", "github"],
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
        // Only institutions and organizations can create organizations
        return user.role === "INSTITUTION" || user.role === "ORGANIZATION";
      },
      organizationHooks: {
        // Before creating an invitation
        beforeCreateInvitation: async ({
          invitation,
          inviter,
          organization,
        }) => {
          // Custom validation or expiration logic
          const customExpiration = new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 7
          ); // 7 days

          return {
            data: {
              ...invitation,
              expiresAt: customExpiration,
            },
          };
        },

        // After creating an invitation
        afterCreateInvitation: async ({
          invitation,
          inviter,
          organization,
        }: any) => {
          // Send custom invitation email
          try {
            await transporter.sendMail({
              to: invitation.email,
              subject: `You've been invited to join ${organization.name}`,
              html: await render(
                reactInvitationEmail({
                  username: invitation.email,
                  invitedByUsername: inviter.name || inviter.email,
                  invitedByEmail: inviter.email,
                  teamName: organization.name,
                  inviteLink:
                    process.env.NODE_ENV === "development"
                      ? `http://localhost:3000/accept-invitation/${invitation.id}`
                      : `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${invitation.id}`,
                }),
              ),
            });
          } catch (error) {
            console.error("Error sending invitation email:", error);
          }
        },

        // Before accepting an invitation
        beforeAcceptInvitation: async ({ invitation, user, organization }: any) => {
          // Check if invitation is still valid
          if (invitation.expiresAt < new Date()) {
            throw new APIError("BAD_REQUEST", {
              message: "Invitation has expired",
            });
          }

          if (invitation.status !== "pending") {
            throw new APIError("BAD_REQUEST", {
              message: "Invitation is no longer valid",
            });
          }

          return {
            data: {
              invitation,
              user,
              organization
            }
          };
        },

        // After accepting an invitation
        afterAcceptInvitation: async ({
          invitation,
          member,
          user,
          organization,
        }: any) => {
          // Update invitation status
          // Fix: only update if invitation exists
          if (invitation && invitation.id) {
            try {
              await prisma.invitation.update({
                where: { id: invitation.id },
                data: { status: "accepted" }
              });
            } catch (error) {
              console.error("Error updating invitation:", error);
            }
          }
        },
      },
      // Configure invitation settings
      invitation: {
        expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
        requireAdmin: false, // Allow organization members to send invitations
        allowCustomMetadata: true, // Enable invitation metadata support
      },

      // Enable multi-organization support
      allowUsersToCreateOrganizations: true,
      async sendInvitationEmail(data: any) {
        // This is now handled in afterCreateInvitation hook for more control
        // Keeping this as fallback
        await transporter.sendMail({
          to: data.email,
          subject: "You've been invited to join an organization",
          html: await render(
            reactInvitationEmail({
              username: data.email,
              invitedByUsername: data.inviter.user.name || data.inviter.user.email,
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
            subject: "Your Two-Factor Authentication Code",
            html: `Your verification code is: ${otp}`,
          });
        },
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
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
          ...session,
          ipAddress: session.ipAddress,
          expiresAt: session.expiresAt,
          token: session.token,
          userAgent: session.userAgent,
          impersonatedBy: session.impersonatedBy,
        },
        user: {
          ...user,
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