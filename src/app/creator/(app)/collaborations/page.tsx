import { requireCreator } from "@/lib/auth/roles";
import {
  CreatorCollaborationsClient,
  type CreatorBookingRow,
} from "@/components/dashboard/creator-collaborations/CreatorCollaborationsClient";
import type { OfferRow } from "@/components/dashboard/creator-collaborations/CreatorOfferModal";

type RawBookingRow = {
  id: string;
  status: "invited" | "draft" | "scheduled" | "live" | "completed" | "declined";
  price_agreed: number;
  scheduled_date: string | null;
  campaign: { name: string; brand: { company_name: string | null } | null } | null;
};

export default async function CreatorCollaborationsPage() {
  const { supabase, user } = await requireCreator();

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!creator) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-500">
          Your marketplace card hasn&apos;t been created yet.
        </p>
      </div>
    );
  }

  // Same `bookings` table the Brand Portal writes to — scoped by the
  // "creator can view own bookings" RLS policy (migration 0009), not a
  // separate query path.
  const { data: bookingsData, error } = await supabase
    .from("bookings")
    .select(
      "id, status, price_agreed, scheduled_date, campaign:campaigns(name, brand:brands(company_name))"
    )
    .eq("creator_id", creator.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load your collaborations: {error.message}
        </p>
      </div>
    );
  }

  const rawBookings = (bookingsData ?? []) as unknown as RawBookingRow[];
  const bookingIds = rawBookings.map((b) => b.id);

  const [{ data: clickRows }, { data: offerRows }] = await Promise.all([
    bookingIds.length
      ? supabase.from("click_events").select("booking_id").in("booking_id", bookingIds)
      : Promise.resolve({ data: [] as { booking_id: string }[] }),
    bookingIds.length
      ? supabase
          .from("booking_offers")
          .select("id, booking_id, offered_by, amount, message, status, created_at")
          .in("booking_id", bookingIds)
      : Promise.resolve({ data: [] as (OfferRow & { booking_id: string })[] }),
  ]);

  const clickCounts = new Map<string, number>();
  for (const c of clickRows ?? []) {
    clickCounts.set(c.booking_id, (clickCounts.get(c.booking_id) ?? 0) + 1);
  }

  const offersByBooking = new Map<string, OfferRow[]>();
  for (const o of offerRows ?? []) {
    const list = offersByBooking.get(o.booking_id) ?? [];
    list.push(o);
    offersByBooking.set(o.booking_id, list);
  }

  const bookings: CreatorBookingRow[] = rawBookings.map((b) => ({
    ...b,
    clicks: clickCounts.get(b.id) ?? 0,
    offers: offersByBooking.get(b.id) ?? [],
  }));

  return <CreatorCollaborationsClient bookings={bookings} />;
}
