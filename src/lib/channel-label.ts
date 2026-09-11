const CHANNEL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "Twitter",
};

export function channelLabel(channel: string) {
  return CHANNEL_LABELS[channel] ?? channel;
}
