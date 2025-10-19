import { Resend } from "resend";
import { siteConfig } from "@/config/site";
import { MagicLinkEmail } from "@/emails/magic-link-email";
import { env } from "@/env.mjs";

import { getUserByEmail } from "../actions/user";

export const resend = new Resend(env.RESEND_API_KEY);

export const sendVerificationRequest = async ({
  identifier,
  url,
  provider,
}) => {
  const user = await getUserByEmail(identifier);
  if (!user?.name) return;

  const userVerified = !!user?.emailVerified;
  const authSubject = userVerified
    ? `Sign-in link for ${siteConfig.name}`
    : "Activate your account";

  try {
    const { data, error } = await resend.emails.send({
      from: provider.from!,
      to:
        process.env.NODE_ENV === "development"
          ? "delivered@resend.dev"
          : identifier,
      subject: authSubject,
      react: MagicLinkEmail({
        firstName: user?.name as string,
        actionUrl: url,
        mailType: userVerified ? "login" : "register",
        siteName: siteConfig.name,
      }),
      // Set this to prevent Gmail from threading emails.
      // More info: https://resend.com/changelog/custom-email-headers
      headers: {
        "X-Entity-Ref-ID": Date.now() + "",
      },
    });

    if (error || !data) {
      throw new Error(error?.message);
    }

    // console.log(data)
  } catch (error) {
    throw new Error("Failed to send verification email.");
  }
};
