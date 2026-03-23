import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/auth/team(.*)"]);
const isRunnerRoute = createRouteMatcher(["/api/jobs/(.*)"]);

const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
const BASIC_AUTH_PASS = process.env.BASIC_AUTH_PASS;

function passBasicAuth(req: NextRequest) {
  if (BASIC_AUTH_USER == null || BASIC_AUTH_PASS == null) return true;

  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Basic ")) return false;

  const [, encoded] = authHeader.split(" ");

  let decoded: string;

  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const [user, pass] = decoded.split(":");

  return user === BASIC_AUTH_USER && pass === BASIC_AUTH_PASS;
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}

export default clerkMiddleware(async (auth, req) => {
  if (isRunnerRoute(req)) {
    return NextResponse.next();
  }

  if (passBasicAuth(req) !== true) {
    return unauthorized();
  }

  if (isPublicRoute(req) !== true) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
