// packages/auth/src/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@draftroom/db";

// Get the Cloudflare URL from environment
const CLOUDFLARE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  secret: process.env.BETTER_AUTH_SECRET as string,

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },

  // ✅ Important: Use the Cloudflare URL
  baseURL: CLOUDFLARE_URL,
  
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    CLOUDFLARE_URL,
    process.env.BETTER_AUTH_URL || CLOUDFLARE_URL,
  ],

  // ✅ Enable cross-origin requests
  crossOrigin: true,

  // ✅ Disable CSRF for testing (temporarily)
  csrf: {
    enabled: false,
  },

  // ✅ Add better error logging
  onError: (error) => {
    console.error("🔴 BetterAuth Error:", error);
  },
});