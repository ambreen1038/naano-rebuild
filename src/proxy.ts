import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16 renamed the `middleware` file convention to `proxy` — this is
// that file, not legacy middleware. Refreshes the Supabase session cookie on
// every request and gates /brand and /creator behind a signed-in user.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected =
    request.nextUrl.pathname.startsWith("/brand") ||
    request.nextUrl.pathname.startsWith("/creator");

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    // Carry over any cookies Supabase refreshed above. Returning a fresh
    // response here would drop the rotated tokens, so the next request would
    // fail auth again and redirect again — an infinite loop.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  // Runs on everything except static assets and the public click-tracking
  // redirect, which must stay fast and unauthenticated.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|r/).*)"],
};
