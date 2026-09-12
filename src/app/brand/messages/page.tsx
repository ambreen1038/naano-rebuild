import { requireBrand } from "@/lib/auth/roles";
import { MessagesClient } from "@/components/dashboard/messages/MessagesClient";
import { sendBrandMessage, markBrandThreadRead } from "./actions";
import type { CampaignOption, MessageThread } from "@/components/dashboard/messages/types";

type RawBooking = {
  id: string;
  status: string;
  campaign: { id: string; name: string } | null;
  creator: { id: string; name: string; avatar_url: string | null } | null;
};

type RawMessage = {
  id: number;
  booking_id: string;
  sender_role: "brand" | "creator";
  body: string;
  read_at: string | null;
  created_at: string;
};

export default async function MessagesPage() {
  const { supabase } = await requireBrand();

  // Real per-booking threads (see supabase/migrations/0022_messages.sql) —
  // one thread per booking, same table both portals read/write, scoped by
  // RLS to the active brand's own bookings.
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      "id, status, campaign:campaigns(id, name), creator:creators(id, name, avatar_url)"
    )
    .order("created_at", { ascending: false });

  const bookings = (bookingsData ?? []) as unknown as RawBooking[];
  const bookingIds = bookings.map((b) => b.id);

  const { data: messagesData } = bookingIds.length
    ? await supabase
        .from("messages")
        .select("id, booking_id, sender_role, body, read_at, created_at")
        .in("booking_id", bookingIds)
        .order("created_at", { ascending: true })
    : { data: [] as RawMessage[] };

  const rawMessages = (messagesData ?? []) as unknown as RawMessage[];
  const messagesByBooking = new Map<string, RawMessage[]>();
  for (const m of rawMessages) {
    const list = messagesByBooking.get(m.booking_id) ?? [];
    list.push(m);
    messagesByBooking.set(m.booking_id, list);
  }

  const threads: MessageThread[] = bookings
    .filter((b) => b.creator && b.campaign)
    .map((b) => {
      const msgs = messagesByBooking.get(b.id) ?? [];
      return {
        bookingId: b.id,
        otherPartyName: b.creator!.name,
        otherPartyAvatarUrl: b.creator!.avatar_url,
        campaignId: b.campaign!.id,
        campaignName: b.campaign!.name,
        status: b.status,
        unreadCount: msgs.filter(
          (m) => m.sender_role === "creator" && m.read_at === null
        ).length,
        messages: msgs.map((m) => ({
          id: m.id,
          senderRole: m.sender_role,
          body: m.body,
          createdAt: m.created_at,
        })),
      };
    });

  const campaignOptions: CampaignOption[] = Array.from(
    new Map(
      bookings.filter((b) => b.campaign).map((b) => [b.campaign!.id, b.campaign!.name])
    ).entries()
  ).map(([id, name]) => ({ id, name }));

  return (
    <MessagesClient
      viewerRole="brand"
      threads={threads}
      campaignOptions={campaignOptions}
      onSend={sendBrandMessage}
      onMarkRead={markBrandThreadRead}
    />
  );
}
