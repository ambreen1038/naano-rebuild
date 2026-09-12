import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { siteKeyToBrandId } from "@/lib/site-key";

// Public, unauthenticated ingestion endpoint: this is what the Pixel Naano
// snippet (served from /api/n.js) actually calls from a brand's own
// external website, so — like /r/[slug] — it uses the service-role client
// (no user session exists to check RLS against).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { site_key, event, ref, ...payload } = body as Record<string, unknown>;
  const brandId = typeof site_key === "string" ? siteKeyToBrandId(site_key) : null;
  const eventType = typeof event === "string" ? event.trim().slice(0, 100) : "";

  if (!brandId || !eventType) {
    return NextResponse.json(
      { ok: false, error: "Missing or invalid site_key/event" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const supabase = createServiceClient();

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("id", brandId)
    .maybeSingle();
  if (!brand) {
    return NextResponse.json(
      { ok: false, error: "Unknown site key" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  // Attribution: naano_ref (a booking's tracking_slug) is set by /r/[slug]
  // on the original creator-post click redirect and carried forward by the
  // pixel script. Only trusted when it resolves to a booking under THIS
  // brand's own campaigns — otherwise treated as absent.
  let bookingId: string | null = null;
  if (typeof ref === "string" && ref) {
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, campaign:campaigns(brand_id)")
      .eq("tracking_slug", ref)
      .maybeSingle();
    const bookingBrandId = (
      booking?.campaign as unknown as { brand_id?: string } | null
    )?.brand_id;
    if (booking && bookingBrandId === brandId) {
      bookingId = booking.id;
    }
  }

  await supabase.from("site_events").insert({
    brand_id: brandId,
    event_type: eventType,
    booking_id: bookingId,
    payload,
  });

  // A real, attributed conversion (not a bare pageview) becomes a lead on
  // the existing Results tab, reusing that table rather than building a
  // second, parallel "conversions" concept.
  if (bookingId && eventType !== "pageview") {
    const personName = typeof payload.name === "string" ? payload.name : null;
    const companyName =
      typeof payload.company === "string" ? payload.company : null;
    const commitment =
      typeof payload.commitment === "string" ? payload.commitment : eventType;

    await supabase.from("leads").insert({
      booking_id: bookingId,
      person_name: personName,
      company_name: companyName,
      commitment,
      source: "Pixel Naano",
    });
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
