export type ThreadMessage = {
  id: number;
  senderRole: "brand" | "creator";
  body: string;
  createdAt: string;
};

export type MessageThread = {
  bookingId: string;
  otherPartyName: string;
  otherPartyAvatarUrl: string | null;
  campaignId: string;
  campaignName: string;
  status: string;
  unreadCount: number;
  messages: ThreadMessage[];
};

export type CampaignOption = { id: string; name: string };

export type MessageActionResult = { ok: true } | { ok: false; error: string };
