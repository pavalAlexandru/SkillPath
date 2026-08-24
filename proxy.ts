import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export function normalizeAppRole(value: unknown): "STUDENT" | "MENTOR" | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();

  if (normalized === "student") return "STUDENT";
  if (normalized === "mentor") return "MENTOR";

  return null;
}

export async function proxy(request: NextRequest) {
  if (
      process.env.NODE_ENV === "test" ||
      request.headers.get("x-e2e-test") === "true"
  ) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options),
            );
          },
        },
      },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const isStudentPath = [
    "/dashboard",
    "/profile",
    "/propose",
    "/assessment",
  ].some((p) => path.startsWith(p));

  const isMentorPath = [
    "/overview",
    "/questions",
    "/proposals",
    "/categories",
  ].some((p) => path.startsWith(p));

  const isProtectedPath = isStudentPath || isMentorPath;

  if (!user && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isProtectedPath) {
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    const role = normalizeAppRole(profile?.role);

    if (isStudentPath && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isMentorPath && role !== "MENTOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Studenții noi (0 teste) sunt trimiși obligatoriu la Onboarding
    if (role === "STUDENT") {
      const isOnboardingRoute = path.startsWith("/assessment/onboarding");

      if (!isOnboardingRoute) {
        const { count } = await supabase
            .from("assessments")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "COMPLETED");

        const hasCompletedAssessments = (count || 0) > 0;

        if (!hasCompletedAssessments) {
          return NextResponse.redirect(new URL("/assessment/onboarding", request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};