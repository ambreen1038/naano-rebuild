import { createClient } from "@/lib/supabase/server";
import {
  CollaborationsClient,
  type BookingRow,
} from "@/components/dashboard/collaborations/CollaborationsClient";

export default async function CollaborationsPage() {
  const supabase = await createClient();

  const [{ data: bookings }, { data: campaigns }] = await Promise.all([
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
  ]);

  // Supabase types a to-one foreign-table select as an array; these are always
  // single rows since campaign_id/creator_id are both not-null foreign keys.
  const rows = (bookings ?? []) as unknown as BookingRow[];

  return <CollaborationsClient bookings={rows} campaigns={campaigns ?? []} />;
}
