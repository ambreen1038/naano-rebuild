"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/** Drop-in replacement for a plain `<button type="submit">` inside a
 * `<form action={serverAction}>` — reads the enclosing form's real pending
 * state via useFormStatus, so a plain Server Component page gets a real
 * loading state without being rewritten into a client component with its
 * own hand-rolled `submitting` state. */
export function SubmitButton({
  children,
  className,
  pendingText,
}: {
  children: React.ReactNode;
  className?: string;
  pendingText?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
