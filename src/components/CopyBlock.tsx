"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBlock({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 ${className}`}
    >
      <code className="truncate text-sm">{text}</code>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md p-1.5 text-[var(--muted)] hover:bg-white hover:text-[var(--foreground)]"
        aria-label="Copy"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}
