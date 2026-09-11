import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Public, unauthenticated redirect: this is the link creators actually post.
// Anyone on LinkedIn can hit it, so it uses the service-role client (no
// user session exists to check RLS against) rather than the normal server
// client. Logs a real click_events row, then forwards to the campaign's
// landing page — this is what makes "Qualified clicks" on the Results tab
// real data instead of a stat with no source.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, campaign:campaigns(landing_url)")
    .eq("tracking_slug", slug)
    .single();

  if (!booking) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await supabase.from("click_events").insert({
    booking_id: booking.id,
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent"),
  });

  const campaign = booking.campaign as unknown as { landing_url: string | null } | null;
  const destination = campaign?.landing_url || new URL("/", request.url).toString();

  return NextResponse.redirect(destination);
}
