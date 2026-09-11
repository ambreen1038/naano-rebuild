import { requireCreator } from "@/lib/auth/roles";
import {
  CreatorCollaborationsClient,
  type CreatorBookingRow,
} from "@/components/dashboard/creator-collaborations/CreatorCollaborationsClient";

type RawBookingRow = {
  id: string;
  status: "draft" | "scheduled" | "live" | "completed";
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

  const { data: clickRows } = bookingIds.length
    ? await supabase
        .from("click_events")
        .select("booking_id")
        .in("booking_id", bookingIds)
    : { data: [] as { booking_id: string }[] };

  const clickCounts = new Map<string, number>();
  for (const c of clickRows ?? []) {
    clickCounts.set(c.booking_id, (clickCounts.get(c.booking_id) ?? 0) + 1);
  }

  const bookings: CreatorBookingRow[] = rawBookings.map((b) => ({
    ...b,
    clicks: clickCounts.get(b.id) ?? 0,
  }));

  return <CreatorCollaborationsClient bookings={bookings} />;
}
