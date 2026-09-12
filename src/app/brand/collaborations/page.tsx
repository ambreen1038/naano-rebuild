import { createClient } from "@/lib/supabase/server";
import {
  CollaborationsClient,
  type BookingRow,
  type ApplicationRow,
} from "@/components/dashboard/collaborations/CollaborationsClient";
import type { OfferRow } from "@/components/dashboard/collaborations/BrandOfferModal";

export default async function CollaborationsPage() {
  const supabase = await createClient();

  const [{ data: bookings }, { data: campaigns }, { data: applications }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select(
          "id, status, price_agreed, scheduled_date, created_at, campaign:campaigns(id, name), creator:creators(id, name)"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("campaigns")
        .select("id, name")
        .order("created_at", { ascending: false }),
      // Creator-initiated applications (migration 0014) — the missing
      // "Invitations received" side. Same campaign-ownership RLS as
      // everything else (0014's "brand can view applications on own
      // campaigns" policy), not a separate query path.
      supabase
        .from("campaign_applications")
        .select(
          "id, status, created_at, campaign:campaigns(id, name), creator:creators(id, name, headline, vertical, industry_tags, country, follower_count, price_per_post, median_views, cpm, engagement_rate, last_posted_at, linkedin_url, avatar_url, bundle_price)"
        )
        .order("created_at", { ascending: false }),
    ]);

  // Supabase types a to-one foreign-table select as an array; these are always
  // single rows since campaign_id/creator_id are both not-null foreign keys.
  const rows = (bookings ?? []) as unknown as BookingRow[];
  const bookingIds = rows.map((b) => b.id);

  const { data: offerRows } = bookingIds.length
    ? await supabase
        .from("booking_offers")
        .select("id, booking_id, offered_by, amount, message, status, created_at")
        .in("booking_id", bookingIds)
    : { data: [] as (OfferRow & { booking_id: string })[] };

  const offersByBooking = new Map<string, OfferRow[]>();
  for (const o of offerRows ?? []) {
    const list = offersByBooking.get(o.booking_id) ?? [];
    list.push(o);
    offersByBooking.set(o.booking_id, list);
  }

  const bookingsWithOffers: BookingRow[] = rows.map((b) => ({
    ...b,
    offers: offersByBooking.get(b.id) ?? [],
  }));

  return (
    <CollaborationsClient
      bookings={bookingsWithOffers}
      campaigns={campaigns ?? []}
      applications={(applications ?? []) as unknown as ApplicationRow[]}
    />
  );
}
