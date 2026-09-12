import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth (Google / LinkedIn) redirects back here with a code to exchange for a
// session. Requires the provider to be enabled in the Supabase dashboard.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const role = searchParams.get("role");
  const providerError = searchParams.get("error_description");

  if (providerError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(providerError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Missing authorization code")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // An OAuth provider's metadata can't carry our intended role, so the signup
  // trigger defaults every OAuth user to 'brand'. Correct that here when the
  // user came through the creator path.
  if (role === "creator" && profile?.role === "brand") {
    await supabase
      .from("profiles")
      .update({ role: "creator", active_brand_id: null })
      .eq("id", user.id);
    await supabase
      .from("creator_onboarding")
      .upsert({ user_id: user.id, step: 2 }, { onConflict: "user_id" });
  }

  const effectiveRole =
    role === "creator" ? "creator" : (profile?.role ?? "brand");

  // /creator gates on onboarding progress and forwards to the right step.
  return NextResponse.redirect(
    `${origin}${effectiveRole === "creator" ? "/creator" : "/brand"}`
  );
}
