"use client";

import { PortalError } from "@/components/dashboard/PortalError";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PortalError {...props} />;
}
