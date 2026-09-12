import { requireCreator } from "@/lib/auth/roles";
import { MessagesClient } from "@/components/dashboard/messages/MessagesClient";
import { sendCreatorMessage, markCreatorThreadRead } from "./actions";
import type { CampaignOption, MessageThread } from "@/components/dashboard/messages/types";

type RawBooking = {
  id: string;
  status: string;
  campaign: {
    id: string;
    name: string;
    brand: { company_name: string | null; logo_url: string | null } | null;
  } | null;
};

type RawMessage = {
  id: number;
  booking_id: string;
  sender_role: "brand" | "creator";
  body: string;
  read_at: string | null;
  created_at: string;
};

export default async function CreatorMessagesPage() {
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

  // Same `bookings`/`messages` tables the Brand Portal writes to — scoped
  // by RLS to this creator's own bookings (migration 0022).
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(
      "id, status, campaign:campaigns(id, name, brand:brands(company_name, logo_url))"
    )
    .eq("creator_id", creator.id)
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
    .filter((b) => b.campaign)
    .map((b) => {
      const msgs = messagesByBooking.get(b.id) ?? [];
      return {
        bookingId: b.id,
        otherPartyName: b.campaign!.brand?.company_name || "Brand",
        otherPartyAvatarUrl: b.campaign!.brand?.logo_url ?? null,
        campaignId: b.campaign!.id,
        campaignName: b.campaign!.name,
        status: b.status,
        unreadCount: msgs.filter(
          (m) => m.sender_role === "brand" && m.read_at === null
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
      viewerRole="creator"
      threads={threads}
      campaignOptions={campaignOptions}
      onSend={sendCreatorMessage}
      onMarkRead={markCreatorThreadRead}
    />
  );
}
