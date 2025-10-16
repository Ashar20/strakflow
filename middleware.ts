import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Check if Clerk environment variables are available
const hasClerkConfig = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_SECRET_KEY;

export default clerkMiddleware({
  // Only run if Clerk is properly configured
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_cHJvZm91bmQtZm94aG91bmQtNzguY2xlcmsuYWNjb3VudHMuZGV2JA",
  secretKey: process.env.CLERK_SECRET_KEY || "sk_test_placeholder",
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

